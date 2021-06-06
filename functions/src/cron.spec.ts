jest.mock("firebase-functions");
import cron from "./cron";

describe("function", () => {
  it("runs", async () => {
    cron();
  });
});
