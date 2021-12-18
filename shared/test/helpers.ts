import * as time from "../time";

export const setNow = (yyyy: number, m: number, d: number): number => {
  const value: number = Date.UTC(yyyy, m - 1, d, 12) / 1000;
  jest.spyOn(time, "now").mockReturnValue(value);
  return value;
};
