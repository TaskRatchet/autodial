import dial from "./dial"
import {now} from "./time"
import {describe, it, expect} from "@jest/globals"

jest.mock("./time")

const mockNow = (yyyy, m, d) => now.mockReturnValue(Date.UTC(yyyy, m-1, d, 12)/1000)

describe("dial function", () => {
  it("dials goal with no datapoints", () => {
    mockNow(2021, 1, 25)

    const r = dial({
      runits: 'd',
      roadall: [["20210125", 0, null], ["20210201", null, 1]], 
      datapoints: []
    })

    expect(r[1][2]).toEqual(0)
  })
  
  it("dials goal with datapoint at start", () => {
    mockNow(2021, 1, 25)

    const r = dial({
      runits: 'd',
      roadall: [["20210125", 0, null], ["20210201", null, 1]], 
      datapoints: [["20210125", 1, "comment"]]
    })

    expect(r[1][2]).toEqual(Infinity)
  })

  it("dials goal with datapoint after a week", () => {
    mockNow(2021, 2, 1)

    const r = dial({
      runits: 'd',
      roadall: [["20210125", 0, null], ["20210201", null, 1]], 
      datapoints: [["20210125", 1, "comment"]]
    })

    expect(Math.abs(r[1][2] - 1/7)).toBeLessThanOrEqual(1e-12)
  })

  // for now we'll expect this to autodial to zero when you've entered no data
  // in a month but eventually we'll want to treat that as a bug. autodialer should
  // never give you an infinitely flat road that never makes you do anything ever
  // again.
  it("dials goal with more than a month of data", () => {
    mockNow(2021, 3, 1)

    const r = dial({
      runits: 'd',
      roadall: [["20210125", 0, null], ["20210301", null, 1]], 
      datapoints: [["20210125", 1, "comment"]]
    })

    expect(r[1][2]).toEqual(0)
  })

  it("dials goal with datapoint after a week with runits=weekly", () => {
    mockNow(2021, 2, 1)

    const r = dial({
      runits: 'w',
      roadall: [["20210125", 0, null], ["20210201", null, 1]], 
      datapoints: [["20210125", 1, "comment"]]
    })

    expect(Math.abs(r[1][2] - 1)).toBeLessThanOrEqual(1e-12)
  })

  // what happens when average rate is zero? What if it just didn't do anything, didn't change the rate at all? Or perhaps the user sets min and max instead of a single limit?

  // waiting for: api maybe handles kyoom, aggday, odom
})