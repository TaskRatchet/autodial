import {now} from "./time";
import {searchLow} from "./search";

const DIY = 365.25; // this is what physicists use, eg, to define a light year
const SID = 86400; // seconds in a day (not used: DIM=DIY/12, WIM=DIY/12/7)

// Number of seconds in a year, month, etc
const SECS = {
  "y": DIY * SID,
  "m": DIY * SID / 12,
  "w": 7 * SID,
  "d": SID,
  "h": 3600,
};
// Unit names
const UNAM = {
  "y": "year",
  "m": "month",
  "w": "week",
  "d": "day",
  "h": "hour",
};

function mean(array) {
  if (!array.length) return 0;

  const numerator = array.reduce((a, b) => a + b, 0);
  const denominator = array.length;

  return numerator / denominator;
}

// Utility function for stepify. Takes a list of datapoints sorted by x-value
// and a given x-value and finds the most recent y-value (the one with the
// greatest x-value in d that's less than or equal to the given x).
// It's like Mathematica's Interpolation[] with interpolation order 0.
// If the given x is strictly less than d[0][0], return d[0][1].
function stepFunc(d, x) {
  const i = Math.max(0, searchLow(d, p => p[0] - x));
  return d[i][1];
}

// Take a list of datapoints sorted by x-value and return a pure function that
// interpolates a step function from the data, always mapping to the most
// recent y-value.
function stepify(d) {
  !d || !d.length ? x => 0 : x => stepFunc(d, x);
}

// Take list of datapoints and a window (in seconds), return average rate in
// that window.
function avgrate(data, window) {
  // console.log(`calling avgrate; datepoints: ${JSON.stringify(data)}`)
  if (!data || !data.length) return 0;
  data = data.map(p => [parsedate(p[0]), p[1]]); // convert daystamps to unixtimes

  // now we can stepify the data and get a data function, df, that maps any
  // unixtime to the most recent y-value as of that unixtime:
  const df = stepify(data); // df is the data function

  const vdelta = df(now()) - df(now() - window - 1);
  // console.log({window, vdelta})
  return vdelta / window;
}

// Clip x to be at least a and at most b: min(b,max(a,x)). Swaps a & b if a > b.
function clip(x, a, b) {
  if (a > b) [a, b] = [b, a];
  return x < a ? a : x > b ? b : x;
}

type Goal = {
  runits: "h" | "d" | "w" | "m" | "y",
  roadall: [string | null, number | null, number | null][],
  datapoints: [string, number, string][]
}

type Options = {
  min?: number,
  max?: number
}

// Takes a goal g which includes roadall and data, returns new roadall
export default function dial(g: Goal, opts: Options = {}) {
  const {min = -Infinity, max = Infinity} = opts;
  const siru = SECS[g.runits]; // seconds in rate units
  // console.log(`siru: ${siru}`)
  const t = now();

  const firstrow = g.roadall[0];
  const lastrow = g.roadall[g.roadall.length - 1];
  const st = parsedate(firstrow[0]); // start time

  const window = Math.min(30 * SID, t - st);
  const arps = avgrate(g.datapoints, window); // avg rate per second

  return [
    ...g.roadall.slice(0, -1),
    [lastrow[0], lastrow[1], clip(arps * siru, min, max)],
  ];
}

// Take a daystamp like "20210201" and return unixtime
function parsedate(s) {
  const y = +s.slice(0, 4);
  const m = +s.slice(4, 6);
  const d = +s.slice(6, 8);
  return Date.UTC(y, m - 1, d, 12) / 1000;
}

// not currently used...
// Turn a Date object (default now) to unixtime in seconds
function unixtm(d = null) {
  if (d === null) {
    d = new Date();
  }
  return d.getTime() / 1000;
}
