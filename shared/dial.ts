import {now} from "./time";
import {AKRASIA_HORIZON, SID, UNIT_SECONDS} from "./constants";
import getRollingAverageRate from "./getRollingAverageRate";

// Clip x to be at least a and at most b: min(b,max(a,x)). Swaps a & b if a > b.
function clip(x: number, a: number, b: number) {
  if (a > b) [a, b] = [b, a];
  return x < a ? a : x > b ? b : x;
}

type Options = {
  min?: number,
  max?: number
}

// Takes a goal g which includes roadall and data, returns new roadall
export default function dial(
    g: GoalVerbose,
    opts: Options = {}
): Roadall | false {
  const firstRow = g.roadall[0];

  if (!firstRow[0]) {
    throw new Error("Goal road has no initial daystamp!");
  }

  const t = now();
  const hasSufficientHistory = t - firstRow[0] >= SID * 30;

  if (!hasSufficientHistory) return false;

  const {min = -Infinity, max = Infinity} = opts;
  const siru = UNIT_SECONDS[g.runits]; // seconds in rate units
  const lastRow = g.roadall[g.roadall.length - 1];
  const arps = getRollingAverageRate(g);
  const newRate = clip(arps * siru, min, max);
  const tail = g.roadall.slice(0, -1);
  const lastRowModified: Roadall[0] = [lastRow[0], lastRow[1], newRate];
  const fullTail = g.fullroad.slice(0, -1);
  const unixTimes = fullTail.map((r) => r[0]);
  const shouldAddBoundary = !unixTimes.some((ut) => ut >= t + AKRASIA_HORIZON);

  if (!shouldAddBoundary) {
    return [
      ...tail,
      lastRowModified,
    ];
  }

  return [
    ...tail,
    [t + AKRASIA_HORIZON, null, lastRow[2]],
    lastRowModified,
  ];
}
