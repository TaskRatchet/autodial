/**
 * @jest-environment jsdom
 */

import React from "react";
import {waitFor} from "@testing-library/react";
import App from "./App";

import {getParams} from "./lib/browser";
import {deleteUser, setUserAuth} from "./lib/database";
import {getGoals, getGoal, getGoalsVerbose, setNow} from "shared-library";
import {r, withMutedReactQueryLogger} from "./lib/test/helpers";
import {GoalInput, makeGoal} from "../functions/cron/lib/test/helpers";
import {parseDate} from "shared-library/time";

jest.mock("./lib/browser");
jest.mock("./lib/database");
jest.mock("./lib/firebase");
jest.mock("../shared/beeminder");

const mockGetParams = getParams as jest.Mock;
const mockSetUserAuth = setUserAuth as jest.Mock;
const mockGetGoals = getGoals as jest.Mock;
const mockGetGoalsVerbose = getGoalsVerbose as jest.Mock;
const mockGetGoal = getGoal as jest.Mock;

function loadParams(params: string) {
  mockGetParams.mockReturnValue(new URLSearchParams(params));
}

function loadGoals(goals: GoalInput[]) {
  const goals_: Partial<GoalVerbose>[] = goals.map((g, i) => makeGoal({
    slug: `slug_${i}`,
    runits: "d",
    fineprint: "#autodial",
    aggday: "sum",
    roadall: [
      [parseDate("20090210"), 0, null],
      [parseDate("20090315"), null, 1],
    ],
    ...g,
  }));

  mockGetGoal.mockImplementation((slug: string) => {
    return {
      datapoints: [],
      ...goals_.find((g) => g.slug === slug),
    };
  });
  mockGetGoalsVerbose.mockResolvedValue(goals_.map((g) => ({
    datapoints: [],
    ...g,
  })));
  mockGetGoals.mockResolvedValue(goals_);
}

describe("Home page", () => {
  beforeEach(() => {
    mockGetParams.mockReturnValue(new URLSearchParams(""));
    mockSetUserAuth.mockResolvedValue(null);
    loadGoals([{slug: "the_slug"}]);
    loadParams("?access_token=abc123&username=alice");
  });

  it("has authenticate button", async () => {
    loadParams("");

    const {getByText} = await r(<App/>);

    await waitFor(() => {
      expect(getByText("Enable Autodialer")).toBeInTheDocument();
    });
  });

  it("links authenticate link", async () => {
    loadParams("");

    const {getByText} = await r(<App/>);

    await waitFor(() => {
      const link = getByText("Enable Autodialer")
          .parentElement as HTMLLinkElement;

      expect(link.href).toContain("https://www.beeminder.com/apps/authorize");
    });
  });

  describe("with mocked env", () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = {...OLD_ENV};
    });

    afterAll(() => {
      process.env = OLD_ENV;
    });

    it("includes client id in authenticate url", async () => {
      loadParams("");

      process.env.REACT_APP_BM_CLIENT_ID = "the_client_id";

      const {getByText} = await r(<App/>);

      await waitFor(() => {
        const link = getByText("Enable Autodialer")
            .parentElement as HTMLLinkElement;

        expect(link.href).toContain("the_client_id");
      });
    });

    it("includes client secret in authenticate url", async () => {
      loadParams("");

      process.env.REACT_APP_APP_URL = "http://the_app_url";

      const {getByText} = await r(<App/>);

      await waitFor(() => {
        const link = getByText("Enable Autodialer")
            .parentElement as HTMLLinkElement;

        expect(link.href).toContain(encodeURIComponent("http://the_app_url"));
      });
    });
  });

  it("persists credentials", async () => {
    await r(<App/>);

    await waitFor(() => {
      expect(setUserAuth).toBeCalledWith("alice", "abc123");
    });
  });

  it("does not persist credentials if none passed", async () => {
    loadParams("");

    await r(<App/>);

    expect(setUserAuth).not.toBeCalled();
  });

  it("gets user goals", async () => {
    await r(<App/>);

    await waitFor(() => {
      expect(getGoalsVerbose).toBeCalledWith("alice", "abc123");
    });
  });

  it("displays Beeminder error message", async () => {
    await withMutedReactQueryLogger(async () => {
      mockGetGoalsVerbose.mockRejectedValue(new Error("the_error_message"));

      const {getByText} = await r(<App/>);

      await waitFor(() => {
        expect(getByText("the_error_message")).toBeInTheDocument();
      });
    });
  });

  it("does not set user auth if bm error", async () => {
    await withMutedReactQueryLogger(async () => {
      mockGetGoalsVerbose.mockRejectedValue(new Error("the_error_message"));

      const {getByText} = await r(<App/>);

      await waitFor(() => {
        expect(getByText("the_error_message")).toBeInTheDocument();
      });

      expect(setUserAuth).not.toBeCalled();
    });
  });

  it("displays beeminder username", async () => {
    const {getByText} = await r(<App/>);

    await waitFor(() => {
      expect(getByText("alice")).toBeInTheDocument();
    });
  });

  it("does not display beeminder username if auth failure", async () => {
    await withMutedReactQueryLogger(async () => {
      mockGetGoalsVerbose.mockRejectedValue(new Error("the_error_message"));

      const {getByText, queryByText} = await r(<App/>);

      await waitFor(() => {
        expect(getByText("the_error_message")).toBeInTheDocument();
      });

      expect(queryByText("alice")).not.toBeInTheDocument();
    });
  });

  it("lists goal slugs", async () => {
    loadGoals([{slug: "the_slug"}]);

    const {getByText} = await r(<App/>);

    await waitFor(() => {
      expect(getByText("the_slug")).toBeInTheDocument();
    });
  });

  it("lists slugs alphabetically", async () => {
    loadGoals([
      {slug: "b_slug"},
      {slug: "a_slug"},
    ]);

    const {getByText} = await r(<App/>);

    await waitFor(() => {
      const a = getByText("a_slug");
      const el = a.parentElement?.parentElement
          ?.nextSibling?.firstChild?.textContent;
      expect(el).toEqual("b_slug");
    });
  });

  it("hides goals table if user not authenticated", async () => {
    loadParams("");

    const {queryByText} = await r(<App/>);

    expect(queryByText("Here are your goals:")).not.toBeInTheDocument();
  });

  it("displays min value", async () => {
    loadGoals([
      {slug: "the_slug", rate: 3, fineprint: "#autodialMin=1"},
    ]);

    const {getByText} = await r(<App/>);

    await waitFor(() => {
      expect(getByText("1/d")).toBeInTheDocument();
    });
  });

  it("displays negative infinity if no min set for enabled goal", async () => {
    loadGoals([
      {slug: "the_slug", fineprint: "#autodial"},
    ]);

    const {getByText} = await r(<App/>);

    await waitFor(() => {
      expect(getByText("Negative Infinity")).toBeInTheDocument();
    });
  });

  it("does not display min if autodial not enabled for goal", async () => {
    loadGoals([
      {slug: "the_slug"},
    ]);

    const {queryByText} = await r(<App/>);

    await waitFor(() => {
      expect(queryByText("Negative Infinity")).not.toBeInTheDocument();
    });
  });

  it("displays positive value", async () => {
    loadGoals([
      {slug: "the_slug", rate: 3, fineprint: "#autodialMax=1"},
    ]);

    const {getByText} = await r(<App/>);

    await waitFor(() => {
      expect(getByText("1/d")).toBeInTheDocument();
    });
  });

  it("displays positive infinity if no max set for enabled goal", async () => {
    loadGoals([
      {slug: "the_slug", fineprint: "#autodial"},
    ]);

    const {getByText} = await r(<App/>);

    await waitFor(() => {
      expect(getByText("Positive Infinity")).toBeInTheDocument();
    });
  });

  it("removes login button when data loads successfully", async () => {
    const {queryByText} = await r(<App/>);

    await waitFor(() => {
      expect(queryByText("Enable Autodialer")).not.toBeInTheDocument();
    });
  });

  it("includes disable button", async () => {
    const {getByText} = await r(<App/>);

    await waitFor(() => {
      expect(getByText("Disable Autodialer")).toBeInTheDocument();
    });
  });

  it("links disable button", async () => {
    const {getByText} = await r(<App/>);

    await waitFor(() => {
      expect(getByText("Disable Autodialer").parentElement)
          .toHaveAttribute(
              "href",
              "/?access_token=abc123&username=alice&disable=true",
          );
    });
  });

  it("does not persist credentials if disabling", async () => {
    loadParams("?access_token=abc123&username=alice&disable=true");

    const {getByText} = await r(<App/>);

    await waitFor(() => {
      expect(getByText(
          "The autodialer has been disabled for Beeminder user alice",
      )).toBeInTheDocument();
    });

    expect(setUserAuth).not.toBeCalled();
  });

  it("deletes database user on disable", async () => {
    loadParams("?access_token=abc123&username=alice&disable=true");

    await r(<App/>);

    await waitFor(() => {
      expect(deleteUser).toBeCalledWith("alice");
    });
  });

  it("does not show goals for disabled user", async () => {
    loadParams("?access_token=abc123&username=alice&disable=true");

    const {getByText, queryByText} = await r(<App/>);

    await waitFor(() => {
      expect(getByText(
          "The autodialer has been disabled for Beeminder user alice",
      )).toBeInTheDocument();
    });

    expect(queryByText("Here are your goals:")).not.toBeInTheDocument();
  });

  it("displays error on disable if Beeminder auth fails", async () => {
    await withMutedReactQueryLogger(async () => {
      loadParams("?access_token=abc123&username=alice&disable=true");

      mockGetGoalsVerbose.mockRejectedValue(new Error("the_error_message"));

      const {getByText} = await r(<App/>);

      await waitFor(() => {
        expect(getByText(
            "Unable to disable autodialer for Beeminder user alice: " +
          "Beeminder authentication failed.",
        )).toBeInTheDocument();
      });
    });
  });

  it("does not display disable success message if auth fails", async () => {
    await withMutedReactQueryLogger(async () => {
      loadParams("?access_token=abc123&username=alice&disable=true");

      mockGetGoalsVerbose.mockRejectedValue(new Error("the_error_message"));

      const {getByText, queryByText} = await r(<App/>);

      expect(queryByText(
          "The autodialer has been disabled for Beeminder user alice",
      )).not.toBeInTheDocument();

      await waitFor(() => {
        expect(getByText(
            "Unable to disable autodialer for Beeminder user alice: " +
          "Beeminder authentication failed.",
        )).toBeInTheDocument();
      });

      expect(queryByText(
          "The autodialer has been disabled for Beeminder user alice",
      )).not.toBeInTheDocument();
    });
  });

  it("displays loading indicator while loading", async () => {
    const {getByText} = await r(<App/>);

    expect(getByText("loading...")).toBeInTheDocument();
  });

  it("does not display enable button while loading", async () => {
    const {queryByText} = await r(<App/>);

    expect(queryByText("Enable Autodialer")).not.toBeInTheDocument();
  });

  it("does not get goals if no username", async () => {
    loadParams("");

    await r(<App/>);

    expect(getGoals).not.toBeCalled();
  });

  it("only shows enabled goals", async () => {
    loadGoals([
      {slug: "slug_a", fineprint: ""},
      {slug: "slug_b", fineprint: "#autodial"},
    ]);

    const {queryByText, getByText} = await r(<App/>);

    await waitFor(() => {
      expect(getByText("slug_b")).toBeInTheDocument();
    });

    expect(queryByText("slug_a")).not.toBeInTheDocument();
  });

  it("links slugs", async () => {
    loadGoals([{slug: "the_slug"}]);

    const {getByText} = await r(<App/>);

    await waitFor(() => {
      expect(getByText("the_slug")).toHaveAttribute("href", "https://beeminder.com/alice/the_slug");
    });
  });

  it("links username", async () => {
    const {getByText} = await r(<App/>);

    await waitFor(() => {
      expect(getByText("alice")).toHaveAttribute("href", "https://beeminder.com/alice");
    });
  });

  it("includes historical average", async () => {
    setNow(2009, 3, 4);

    loadGoals([{
      slug: "the_slug",
      rate: 3,
      roadall: [
        [parseDate("20090210"), 0, null],
        [parseDate("20090315"), null, 1],
      ],
      datapoints: [
        {value: 0, daystamp: "20090210"},
        {
          value: 30,
          daystamp: "20090213",
        },
      ],
    },
    ]);

    const {getByText} = await r(<App/>);

    await waitFor(() => {
      expect(getByText("1/d")).toBeInTheDocument();
    });
  });

  it("reports average in terms of runits", async () => {
    setNow(2009, 3, 4);

    loadGoals([{
      slug: "the_slug",
      rate: 3,
      runits: "m",
      roadall: [
        [parseDate("20090210"), 0, null],
        [parseDate("20090315"), null, 1],
      ],
      datapoints: [
        {value: 0, daystamp: "20090210"},
        {
          value: 30,
          daystamp: "20090213",
        },
      ],
    },
    ]);

    const {getByText} = await r(<App/>);

    await waitFor(() => {
      expect(getByText("30.44/m")).toBeInTheDocument();
    });
  });
});

// TODO:
// add route to handle de-authorizing the app from Beeminder side (will need
//   de-auth cloud function to handle post data)
