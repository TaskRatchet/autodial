import doCron from "./doCron";
import {
  dial,
  getGoals,
  Goal,
  GoalVerbose,
  Roadall,
  updateGoal,
  getGoal,
} from "../../src/lib";
import {getUsers} from "./database";
import {makeGoal} from "./test/helpers";

jest.mock("firebase-functions");
jest.mock("./log");
jest.mock("./database");
jest.mock("../../src/lib/dial");
jest.mock("../../src/lib/beeminder");

const mockGetGoals = getGoals as jest.Mock;
const mockGetGoal = getGoal as jest.Mock;
const mockDial = dial as jest.Mock;
const mockGetUsers = getUsers as jest.Mock;

function setGoal(g: Partial<Goal>) {
  mockGetGoal.mockResolvedValue(g as GoalVerbose);
  mockGetGoals.mockResolvedValue([g as Goal]);
}

describe("function", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockGetGoals.mockResolvedValue([]);
    mockGetUsers.mockResolvedValue([{
      "beeminder_user": "the_user",
      "beeminder_token": "the_token",
    }]);
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

    await new Promise(process.nextTick);

    expect(dial).toBeCalledWith(goal, expect.anything());
  });

  it("supports min", async () => {
    const goal = makeGoal({
      fineprint: "#autodialMin=1.5",
    });

    setGoal(goal);

    await doCron();

    await new Promise(process.nextTick);

    expect(dial).toBeCalledWith(goal, expect.objectContaining({min: 1.5}));
  });

  it("supports max", async () => {
    const goal = makeGoal({
      fineprint: "#autodialMax=1.5",
    });

    setGoal(goal);

    await doCron();

    await new Promise(process.nextTick);

    expect(dial).toBeCalledWith(goal, expect.objectContaining({max: 1.5}));
  });

  it("skips goals without hashtag", async () => {
    const goal = makeGoal();

    setGoal(goal);

    await doCron();

    expect(dial).not.toBeCalled();
  });

  it("persists modified road", async () => {
    mockDial.mockReturnValue("the_new_road" as unknown as Roadall);

    const goal = makeGoal({
      fineprint: "#autodialMin=1",
    });

    setGoal(goal);

    await doCron();

    await new Promise(process.nextTick);

    expect(updateGoal).toBeCalledWith(
        "the_user",
        "the_token",
        "the_slug",
        {roadall: "the_new_road"}
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
// log dial exceptions
// log beeminder exceptions
