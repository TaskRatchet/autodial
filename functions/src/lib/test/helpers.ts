import {expect} from "@jest/globals";
import Matchers = jest.Matchers;
import fillroadall from "../fillroadall";
import {UNIT_SECONDS} from "../constants";

interface MyMatchers<R> extends Matchers<R> {
  toFuzzyEqual(expected: number): R;
}

expect.extend({
  toFuzzyEqual(received: number, expected: number) {
    const pass = Math.abs(received - expected) <= 1e-12;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to fuzzy equal ${expected}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to fuzzy equal ${expected}`,
        pass: false,
      };
    }
  },
});

export const e = expect as never as <T>(actual: T) => MyMatchers<T>;

export function makeGoal(g: Partial<Goal> = {}): Goal {
  const {
    slug = "the_slug",
    aggday = "last",
    kyoom = false,
    runits = "d",
    roadall = [],
    fullroad = fillroadall(roadall, UNIT_SECONDS[runits]),
    datapoints = [],
    fineprint = "",
  } = g;

  return {
    slug,
    aggday,
    kyoom,
    runits,
    roadall,
    fullroad,
    datapoints,
    fineprint,
  };
}
