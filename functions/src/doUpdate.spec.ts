import doUpdate from "./doUpdate";
import {getUser} from "../../src/lib";
import {updateUser} from "./database";

jest.mock("../../src/lib/beeminder");
jest.mock("./database");

const mockGetUser = getUser as jest.Mock;

describe("doUpdate", () => {
  it("runs", async () => {
    await doUpdate("the_user", "the_token");

    expect(getUser).toBeCalledWith("the_user", "the_token");
  });

  it("throws error", async () => {
    mockGetUser.mockImplementation(() => {
      throw new Error("mock error");
    });

    await expect(async () => {
      await doUpdate(
          "the_user",
          "the_token"
      );
    }).rejects.toThrow(expect.anything());
  });

  it("updates user", async () => {
    await doUpdate("the_user", "the_token");

    expect(updateUser).toBeCalledWith("the_user", "the_token");
  });
});
