import {removeUser} from "./database";
import doRemove from "./doRemove";

jest.mock("../../src/lib/beeminder");
jest.mock("./database");

const kv = {} as KVNamespace;

describe("doRemove", () => {
  it("removes user", async () => {
    await doRemove(kv, "the_user", "the_token");

    expect(removeUser).toHaveBeenCalledWith(kv, "the_user");
  });
});
