import doCron from "./doCron";
import {getUsers} from "./lib/database";
import {getGoals, updateGoal} from "./lib/beeminder";
import {makeGoal} from "./lib/test/helpers";
import dial from "./lib/dial";

jest.mock("firebase-functions");
jest.mock("./lib/database");
jest.mock("./lib/beeminder");
jest.mock("./lib/dial");

const mockGetUsers = getUsers as jest.Mock;
const mockGetGoals = getGoals as jest.Mock;
const mockDial = dial as jest.Mock;

describe("function", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockGetUsers.mockResolvedValue([{
      "beeminder_user": "the_user",
      "beeminder_token": "the_token",
    }]);
    mockGetGoals.mockResolvedValue([]);
  });

  it("gets beeminder goals", async () => {
    await doCron();

    expect(getGoals).toBeCalledWith("the_user", "the_token");
  });

  it("dials goals", async () => {
    const goal = makeGoal({
      fineprint: "#autodial",
    });

    mockGetGoals.mockResolvedValue([goal]);

    await doCron();

    expect(dial).toBeCalledWith(goal, expect.anything());
  });

  it("supports min", async () => {
    const goal = makeGoal({
      fineprint: "#autodialMin=1",
    });

    mockGetGoals.mockResolvedValue([goal]);

    await doCron();

    expect(dial).toBeCalledWith(goal, expect.objectContaining({min: 1}));
  });

  it("supports max", async () => {
    const goal = makeGoal({
      fineprint: "#autodialMax=1",
    });

    mockGetGoals.mockResolvedValue([goal]);

    await doCron();

    expect(dial).toBeCalledWith(goal, expect.objectContaining({max: 1}));
  });

  it("skips goals without hashtag", async () => {
    const goal = makeGoal();

    mockGetGoals.mockResolvedValue([goal]);

    await doCron();

    expect(dial).not.toBeCalled();
  });

  it("persists modified road", async () => {
    mockDial.mockReturnValue("the_new_road");

    const goal = makeGoal({
      fineprint: "#autodialMin=1",
    });

    mockGetGoals.mockResolvedValue([goal]);

    await doCron();

    expect(updateGoal).toBeCalledWith(
        "the_user", "the_token", "the_slug", {roadall: "the_new_road"}
    );
  });
});

// TODO:
// dials goals
// persists changes
// log dial exceptions
// log beeminder exceptions
