import cron from "./cron";
import {getUsers} from "./lib/database";
import {getGoals} from "./lib/beeminder";

jest.mock("firebase-functions");
jest.mock("./lib/database");
jest.mock("./lib/beeminder");
jest.mock("./lib/dial");

const mockGetUsers = getUsers as jest.Mock;

describe("function", () => {
  it("gets beeminder goals", async () => {
    mockGetUsers.mockResolvedValue([{
      "beeminder_user": "the_user",
      "beeminder_token": "the_token",
    }]);

    await cron();

    expect(getGoals).toBeCalledWith("the_user", "the_token");
  });
});

// TODO:
// dials goals
// persists changes
// log dial exceptions
// log beeminder exceptions
