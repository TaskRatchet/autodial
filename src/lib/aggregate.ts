import sum from "npm:lodash@4.17.21/sum.js";
import map from "npm:lodash@4.17.21/map.js";
import groupBy from "npm:lodash@4.17.21/groupBy.js";
import { parseDate } from "./time.ts";
import { Aggday, Datapoint } from "./types.ts";

type Reducer = (values: number[]) => number | undefined;

function aggregateByDate(data: Datapoint[], reduce: Reducer): Datapoint[] {
  const sets = groupBy(data, (d: { daystamp: string }) => d.daystamp);
  return map(sets, (s: Datapoint[], k: string) => ({
    daystamp: k,
    timestamp: parseDate(k),
    value: reduce(s.map((d: { value: number }) => d.value)) || 0,
  }));
}

const uniqueMean = (vals: number[]) => {
  const unique = Array.from(new Set(vals));
  return sum(unique) / unique.length;
};

// https://stackoverflow.com/a/53660837/937377
function median(numbers: number[]) {
  const sorted = numbers.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

const methodMap: Partial<{ [k in Aggday]: Reducer }> = {
  last: (vals) => vals.pop(),
  first: (vals) => vals.shift(),
  sum: (vals) => sum(vals),
  min: (vals) => Math.min(...vals),
  max: (vals) => Math.max(...vals),
  count: (vals) => vals.length,
  binary: (vals) => +!!vals.length,
  nonzero: (vals) => +!!vals.filter((v) => v).length,
  truemean: (vals) => sum(vals) / vals.length,
  mean: uniqueMean,
  uniqmean: uniqueMean,
  median: median,
  cap1: (vals) => Math.min(sum(vals), 1),
  square: (vals) => Math.pow(sum(vals), 2),
  triangle: (vals) => (sum(vals) * (sum(vals) + 1)) / 2,
};

export default function aggregate(
  data: Datapoint[],
  method: Aggday
): Datapoint[] {
  const reducer = methodMap[method];

  if (!reducer) {
    throw new Error("Unsupported aggday method!");
  }

  return aggregateByDate(data, reducer);
}
