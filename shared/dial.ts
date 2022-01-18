import {now} from "./time";
import {AKRASIA_HORIZON, SID, UNIT_SECONDS} from "./constants";
import getRollingAverageRate from "./getRollingAverageRate";
import fuzzyEquals from "./fuzzyEquals";

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
  const t = now();
  const {min = -Infinity, max = Infinity} = opts;
  // seconds in rate units
  const siru = UNIT_SECONDS[g.runits];
  // average rate per second
  const arps = getRollingAverageRate(g);
  const len = t - g.fullroad[0][0];
  const oldRate = g.mathishard[2];
  const newRate = arps * siru;
  const monthCompletion = Math.min(len / (SID * 30), 1);
  const rateDiff = oldRate - newRate;
  const modulatedRate = oldRate - (rateDiff * monthCompletion);
  const clippedRate = clip(modulatedRate, min, max);

  if (fuzzyEquals(clippedRate, oldRate)) return false;

  const lastRow = g.fullroad[g.fullroad.length - 1];
  const tail = g.roadall.slice(0, -1);
  const lastRowModified: Roadall[0] = [lastRow[0], null, clippedRate];
  const fullTail = g.fullroad.slice(0, -1);
  const unixTimes = fullTail.map((r) => r[0]);
  const shouldAddBoundary = !unixTimes.some((ut) => {
    return ut >= t + AKRASIA_HORIZON;
  });

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
