import doDial from "./doDial";
import {getGoal, getGoals, updateGoal} from "shared-library";
import {makeGoal} from "../cron/lib/test/helpers";
import dial from "../../shared/dial";

jest.mock("firebase-functions");
jest.mock("../../shared/beeminder");
jest.mock("../../shared/dial");
jest.mock("./lib/log");

const mockGetGoals = getGoals as jest.Mock;
const mockGetGoal = getGoal as jest.Mock;
const mockDial = dial as jest.Mock;

function setGoal(g: Partial<Goal>) {
  mockGetGoal.mockResolvedValue(g);
  mockGetGoals.mockResolvedValue([g]);
}

describe("function", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockGetGoals.mockResolvedValue([]);
  });

  it("gets beeminder goals", async () => {
    await doDial({
      "beeminder_user": "the_user",
      "beeminder_token": "the_token",
    });

    expect(getGoals).toBeCalledWith("the_user", "the_token");
  });

  it("dials goals", async () => {
    const goal = makeGoal({
      fineprint: "#autodial",
    });

    setGoal(goal);

    await doDial({
      "beeminder_user": "the_user",
      "beeminder_token": "the_token",
    });

    await new Promise(process.nextTick);

    expect(dial).toBeCalledWith(goal, expect.anything());
  });

  it("supports min", async () => {
    const goal = makeGoal({
      fineprint: "#autodialMin=1.5",
    });

    setGoal(goal);

    await doDial({
      "beeminder_user": "the_user",
      "beeminder_token": "the_token",
    });

    await new Promise(process.nextTick);

    expect(dial).toBeCalledWith(goal, expect.objectContaining({min: 1.5}));
  });

  it("supports max", async () => {
    const goal = makeGoal({
      fineprint: "#autodialMax=1.5",
    });

    setGoal(goal);

    await doDial({
      "beeminder_user": "the_user",
      "beeminder_token": "the_token",
    });

    await new Promise(process.nextTick);

    expect(dial).toBeCalledWith(goal, expect.objectContaining({max: 1.5}));
  });

  it("skips goals without hashtag", async () => {
    const goal = makeGoal();

    setGoal(goal);

    await doDial({
      "beeminder_user": "the_user",
      "beeminder_token": "the_token",
    });

    expect(dial).not.toBeCalled();
  });

  it("persists modified road", async () => {
    mockDial.mockReturnValue("the_new_road");

    const goal = makeGoal({
      fineprint: "#autodialMin=1",
    });

    setGoal(goal);

    await doDial({
      "beeminder_user": "the_user",
      "beeminder_token": "the_token",
    });

    await new Promise(process.nextTick);

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

    await doDial({
      "beeminder_user": "the_user",
      "beeminder_token": "the_token",
    });

    expect(updateGoal).not.toBeCalled();
  });

  it("handles getGoal 404s", async () => {
    const g = makeGoal({
      fineprint: "#autodial",
    });

    mockGetGoals.mockResolvedValue([g, g]);
    mockGetGoal.mockRejectedValue("the_error");

    await doDial({
      "beeminder_user": "the_user",
      "beeminder_token": "the_token",
    });

    expect(mockGetGoal).toBeCalledTimes(2);
  });
});

// TODO:
// log dial exceptions
// log beeminder exceptions
