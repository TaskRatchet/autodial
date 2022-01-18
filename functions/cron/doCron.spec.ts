import doCron from "./doCron";
import {getUsers} from "./lib/database";
import {getGoal, getGoals, updateGoal} from "shared-library";
import {makeGoal} from "./lib/test/helpers";
import dial from "../../shared/dial";
import * as querystring from "querystring";
import {handler} from "../dial";
import fetch from "node-fetch";

jest.mock("firebase-functions");
jest.mock("./lib/database");
jest.mock("../../shared/beeminder");
jest.mock("../../shared/dial");
jest.mock("./lib/log");
jest.mock("node-fetch");

const mockGetUsers = getUsers as jest.Mock;
const mockGetGoals = getGoals as jest.Mock;
const mockGetGoal = getGoal as jest.Mock;
const mockDial = dial as jest.Mock;
const mockFetch = (fetch as unknown) as jest.Mock;

function setGoal(g: Partial<Goal>) {
  mockGetGoal.mockResolvedValue(g);
  mockGetGoals.mockResolvedValue([g]);
}

describe("function", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockGetUsers.mockResolvedValue([{
      "beeminder_user": "the_user",
      "beeminder_token": "the_token",
    }]);
    mockGetGoals.mockResolvedValue([]);
    mockFetch.mockImplementation(async (url: unknown): Promise<Response> => {
      if (typeof url === "string" && url.startsWith("https://autodial.taskratchet.com/.netlify/functions/dial")) {
        const qs = querystring.parse(url.split("?")[1]);
        const h = (handler as unknown) as (e: any) => Promise<Response>;
        return h({queryStringParameters: qs});
      }
      throw new Error("Invalid function call");
    });
  });

  it("gets beeminder goals", async () => {
    await doCron();

    expect(getGoals).toBeCalledWith("the_user", "the_token");
  });

  it("dials goals", async () => {
    const goal = makeGoal({
      fineprint: "#autodial",
    });

    setGoal(goal);

    await doCron();

    expect(dial).toBeCalledWith(goal, expect.anything());
  });

  it("supports min", async () => {
    const goal = makeGoal({
      fineprint: "#autodialMin=1.5",
    });

    setGoal(goal);

    await doCron();

    expect(dial).toBeCalledWith(goal, expect.objectContaining({min: 1.5}));
  });

  it("supports max", async () => {
    const goal = makeGoal({
      fineprint: "#autodialMax=1.5",
    });

    setGoal(goal);

    await doCron();

    expect(dial).toBeCalledWith(goal, expect.objectContaining({max: 1.5}));
  });

  it("skips goals without hashtag", async () => {
    const goal = makeGoal();

    setGoal(goal);

    await doCron();

    expect(dial).not.toBeCalled();
  });

  it("persists modified road", async () => {
    mockDial.mockReturnValue("the_new_road");

    const goal = makeGoal({
      fineprint: "#autodialMin=1",
    });

    setGoal(goal);

    await doCron();

    expect(updateGoal).toBeCalledWith(
        "the_user", "the_token", "the_slug", {roadall: "the_new_road"}
    );
  });

  it("does not update goal if goal not dialed", async () => {
    mockDial.mockReturnValue(false);

    const goal = makeGoal({
      fineprint: "#autodialMin=1",
    });

    setGoal(goal);

    await doCron();

    expect(updateGoal).not.toBeCalled();
  });

  it("handles getGoal 404s", async () => {
    const g = makeGoal({
      fineprint: "#autodial",
    });

    mockGetGoals.mockResolvedValue([g, g]);
    mockGetGoal.mockRejectedValue("the_error");

    await doCron();

    expect(mockGetGoal).toBeCalledTimes(2);
  });
});

// TODO:
// dials goals
// persists changes
// log dial exceptions
// log beeminder exceptions
// weekends off?
