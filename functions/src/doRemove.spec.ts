import {removeUser} from "./database";
import doRemove from "./doRemove";

jest.mock("../../src/lib/beeminder");
jest.mock("./database");

describe("doRemove", () => {
  it("removes user", async () => {
    await doRemove("the_user", "the_token");

    expect(removeUser).toBeCalledWith("the_user");
  });
});
