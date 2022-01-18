import doCron from "./doCron";
import {getUsers} from "./lib/database";
import fetch from "node-fetch";

jest.mock("firebase-functions");
jest.mock("./lib/database");
jest.mock("../../shared/beeminder");
jest.mock("../../shared/dial");
jest.mock("node-fetch");

const mockGetUsers = getUsers as jest.Mock;

const rawUrl = "https://deploy-preview-23--autodial.netlify.app/.netlify/functions/cron";

describe("function", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockGetUsers.mockResolvedValue([{
      "beeminder_user": "the_user",
      "beeminder_token": "the_token",
    }]);
  });

  it("uses raw url", async () => {
    await doCron({
      rawUrl,
    });

    expect(fetch).toBeCalledWith(
        expect.stringContaining("deploy-preview-23--autodial.netlify.app")
    );
  });
});
