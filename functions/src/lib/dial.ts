import {now, parseDate} from "./time";

import stepify from "./stepify";
import aggregate from "./aggregate";

const DIY = 365.25; // this is what physicists use, eg, to define a light year
const SID = 86400; // seconds in a day (not used: DIM=DIY/12, WIM=DIY/12/7)

const UNIT_SECONDS = {
  "y": DIY * SID,
  "m": DIY * SID / 12,
  "w": 7 * SID,
  "d": SID,
  "h": 3600,
};

// Take list of datapoints and a window (in seconds), return average rate in
// that window.
function avgrate(data: Datapoint[], window: number) {
  if (!data || !data.length) return 0;

  // convert daystamps to unixtimes
  const unixData: UnixDatapoint[] = data.map((p) => [parseDate(p[0]), p[1]]);

  // now we can stepify the data and get a data function, df, that maps any
  // unixtime to the most recent y-value as of that unixtime:
  const df = stepify(unixData); // df is the data function

  const preTime = now() - window - 1;

  const valNow = df(now());
  const valBefore = df(preTime);
  const vdelta = valNow - valBefore;

  return vdelta / window;
}

// Clip x to be at least a and at most b: min(b,max(a,x)). Swaps a & b if a > b.
function clip(x: number, a: number, b: number) {
  if (a > b) [a, b] = [b, a];
  return x < a ? a : x > b ? b : x;
}

function autoSum(data: Datapoint[]): Datapoint[] {
  return data.reduce((prev: Datapoint[], p) => {
    const last = prev[prev.length - 1];
    const sum = last ? last[1] + p[1] : p[1];
    return [...prev, [p[0], sum, p[2]]];
  }, []);
}

type Options = {
  min?: number,
  max?: number
}

// Takes a goal g which includes roadall and data, returns new roadall
export default function dial(g: Goal, opts: Options = {}): Roadall {
  const {min = -Infinity, max = Infinity} = opts;
  const siru = UNIT_SECONDS[g.runits]; // seconds in rate units

  const t = now();

  const firstrow = g.roadall[0];
  const lastrow = g.roadall[g.roadall.length - 1];
  const st = parseDate(firstrow[0] || ""); // start time

  const aggregatedPoints = aggregate(g.datapoints, g.aggday);

  const summed = g.kyoom ? autoSum(aggregatedPoints) : aggregatedPoints;

  const window = Math.min(30 * SID, t - st);
  const arps = avgrate(summed, window); // avg rate per second

  const shouldDial = window >= 30 * SID;
  const newRate = shouldDial ? clip(arps * siru, min, max) : lastrow[2];

  return [
    ...g.roadall.slice(0, -1),
    [lastrow[0], lastrow[1], newRate],
  ];
}
