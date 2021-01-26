import dial from "./dial"
import {now} from "./time"
import {describe, it, expect} from "@jest/globals"

jest.mock("./time")

describe("dial function", () => { 
  it("dials goal with no datapoints", () => {
    const r = dial({
      roadall: [["20210125", 0, null], ["20210201", null, 1]], 
      datapoints: []
    })

    expect(r[1][2]).toEqual(0)
  })
  
  it("dials goal with datapoints", () => {
    const r = dial({
      roadall: [["20210125", 0, null], ["20210201", null, 1]], 
      datapoints: [["20210125", 1, "comment"]]
    })

    expect(r[1][2]).toEqual(1)
  })

  it("dials goal with datapoints", () => {
    // mock the current date to be 2021-02-01
    now.mockReturnValue(1612166400) // unixtime of 2021-02-01
    const r = dial({
      roadall: [["20210125", 0, null], ["20210201", null, 1]], 
      datapoints: [["20210125", 1, "comment"]]
    })

    expect(Math.abs(r[1][2] - 1/7)).toBeLessThanOrEqual(1e-12)
  })

  // account for week/month/hour/etc... (runits)
  // account for cumulative (kyoom)
  // account for aggday

})