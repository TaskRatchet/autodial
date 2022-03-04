import {now} from "./time";
import {AKRASIA_HORIZON, SID, UNIT_SECONDS} from "./constants";
import {getRollingAverageRate} from "./getRollingAverageRate";
import {fuzzyEquals} from "./fuzzyEquals";
import {AutodialSettings, GoalVerbose, Roadall, SparseSegment} from "./index";

function clip(x: number, min: number, max: number) {
  if (min > max) [min, max] = [max, min];
  return x < min ? min : x > max ? max : x;
}

export function dial(
    g: GoalVerbose,
    opts: Partial<AutodialSettings> = {},
): Roadall | false {
  const lastRow = g.roadall[g.roadall.length - 1];

  if (lastRow[2] === null) return false;

  const t = now();
  const {min = -Infinity, max = Infinity, strict = false} = opts;
  const neverLess = strict && g.yaw == 1;
  const neverMore = strict && g.yaw == -1;
  const strictMin = neverLess && g.rate !== null ? Math.max(min, g.rate) : min;
  const strictMax = neverMore && g.rate !== null ? Math.min(max, g.rate) : max;
  const rateSeconds = UNIT_SECONDS[g.runits];
  const averagePerSecond = getRollingAverageRate(g);
  const len = t - g.fullroad[0][0];
  const oldRate = g.mathishard[2];
  const newRate = averagePerSecond * rateSeconds;
  const monthCompletion = Math.min(len / (SID * 30), 1);
  const rateDiff = oldRate - newRate;
  const modulatedRate = oldRate - (rateDiff * monthCompletion);
  const clippedRate = clip(modulatedRate, strictMin, strictMax);

  if (fuzzyEquals(clippedRate, oldRate)) return false;

  const tail = g.roadall.slice(0, -1);
  const lastRowModified: SparseSegment = [lastRow[0], lastRow[1], clippedRate];
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
