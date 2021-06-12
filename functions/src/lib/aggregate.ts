import {sum} from "lodash";

type DirtyData = (Datapoint | undefined)[]
type Reducer = (values: number[]) => number | undefined

function aggregateByDate(data: Datapoint[], reduce: Reducer): DirtyData {
  const dates: string[] = Array.from(new Set(data.map((p) => p[0])));
  return dates.map((d: string) => {
    const points = data.filter((p) => p[0] === d);
    const reduced = reduce(points.map((p) => p[1]));

    if (reduced === undefined) return;

    return [d, reduced, "aggregate"];
  });
}

const methodMap: Partial<{[k in Aggday]: Reducer}> = {
  "last": (vals) => vals.pop(),
  "first": (vals) => vals.shift(),
  "sum": (vals) => sum(vals),
  "min": (vals) => Math.min(...vals),
  "max": (vals) => Math.max(...vals),
  "count": (vals) => vals.length,
};

function getDirtyAggregates(
    data: Datapoint[],
    method: Aggday
): DirtyData {
  const reducer = methodMap[method];

  if (!reducer) {
    throw new Error("Unsupported aggday method!");
  }

  return aggregateByDate(data, reducer);
}

export default function aggregate(
    data: Datapoint[],
    method: Aggday
): Datapoint[] {
  const aggregated = getDirtyAggregates(data, method);

  return aggregated.filter((p): p is Datapoint => p !== undefined);
}
