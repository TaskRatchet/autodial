jest.mock("firebase-functions");
import dial from "./dial";

describe("function", () => {
  it("runs", async () => {
    dial();
    expect(false).toBeTruthy();
  });
});
