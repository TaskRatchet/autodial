import dial from "./dial";
import {now} from "./time";
import {describe, it, expect} from "@jest/globals";

jest.mock("./time");

const mockNow = now as jest.Mock;

const setNow = (yyyy: number, m: number, d: number) => {
  const value: number = Date.UTC(yyyy, m - 1, d, 12) / 1000;
  return mockNow.mockReturnValue(value);
};

describe("dial function", () => {
  it("dials goal with no datapoints", () => {
    setNow(2021, 1, 25);

    const r = dial({
      runits: "d",
      roadall: [["20210125", 0, null], ["20210201", null, 1]],
      datapoints: [],
    });

    expect(r[1][2]).toEqual(0);
  });

  it("dials goal with datapoint at start", () => {
    setNow(2021, 1, 25);

    const r = dial({
      runits: "d",
      roadall: [["20210125", 0, null], ["20210201", null, 1]],
      datapoints: [["20210125", 1, "comment"]],
    });

    expect(r[1][2]).toEqual(Infinity);
  });

  it("dials goal with datapoint after a week", () => {
    setNow(2021, 2, 1);

    const r = dial({
      runits: "d",
      roadall: [["20210125", 0, null], ["20210201", null, 1]],
      datapoints: [["20210125", 1, "comment"]],
    });

    // TODO: name this temp var better
    const num = r[1][2];

    if (num === null) throw new Error("num is null");

    expect(Math.abs(num - 1 / 7)).toBeLessThanOrEqual(1e-12);
  });

  // for now we'll expect this to autodial to zero when you've entered no data
  // in a month but eventually we'll want to treat that as a bug. autodialer
  // should never give you an infinitely flat road that never makes you do
  // anything ever again.
  it("dials goal with more than a month of data", () => {
    setNow(2021, 3, 1);

    const r = dial({
      runits: "d",
      roadall: [["20210125", 0, null], ["20210301", null, 1]],
      datapoints: [["20210125", 1, "comment"]],
    });

    expect(r[1][2]).toEqual(0);
  });

  it("dials goal with datapoint after a week with runits=weekly", () => {
    setNow(2021, 2, 1);

    const r = dial({
      runits: "w",
      roadall: [["20210125", 0, null], ["20210201", null, 1]],
      datapoints: [["20210125", 1, "comment"]],
    });

    // TODO: name this temp var better
    const num = r[1][2];

    if (num === null) throw new Error("num is null");

    expect(Math.abs(num - 1)).toBeLessThanOrEqual(1e-12);
  });

  it("dials goal with min option", () => {
    setNow(2021, 2, 1);

    const r = dial({
      runits: "w",
      roadall: [["20210125", 0, null], ["20210201", null, 1]],
      datapoints: [["20210125", 1, "comment"]],
    }, {min: 2});

    expect(r[1][2]).toEqual(2);
  });

  // waiting for: api maybe handles kyoom, aggday, odom
});
