import {now, parseDate} from "./time";
import {searchLow} from "./search";

const DIY = 365.25; // this is what physicists use, eg, to define a light year
const SID = 86400; // seconds in a day (not used: DIM=DIY/12, WIM=DIY/12/7)

const UNIT_SECONDS = {
  "y": DIY * SID,
  "m": DIY * SID / 12,
  "w": 7 * SID,
  "d": SID,
  "h": 3600,
};


// Utility function for stepify. Takes a list of datapoints sorted by x-value
// and a given x-value and finds the most recent y-value (the one with the
// greatest x-value in d that's less than or equal to the given x).
// It's like Mathematica's Interpolation[] with interpolation order 0.
// If the given x is strictly less than d[0][0], return d[0][1].
function stepFunc(d: UnixDatapoint[], x: number): number {
  const i = Math.max(0, searchLow(d, (p) => p[0] - x));
  return d[i][1];
}

// Take a list of datapoints sorted by x-value and return a pure function that
// interpolates a step function from the data, always mapping to the most
// recent y-value.
function stepify(d: UnixDatapoint[]): (unixDelta: number) => number {
  return !d || !d.length ? (x) => 0 : (x) => stepFunc(d, x);
}

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

  const window = Math.min(30 * SID, t - st);
  const arps = avgrate(g.datapoints, window); // avg rate per second

  const shouldDial = window >= 30 * SID;
  const newRate = shouldDial ? clip(arps * siru, min, max) : lastrow[2];

  return [
    ...g.roadall.slice(0, -1),
    [lastrow[0], lastrow[1], newRate],
  ];
}
