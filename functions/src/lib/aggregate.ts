import {findLast, find} from "lodash";

function getDirtyAggregates(
    data: Datapoint[],
    method: Aggday
): (Datapoint | undefined)[] {
  const dates: string[] = Array.from(new Set(data.map((p) => p[0])));

  switch (method) {
    case "last": {
      return dates.map((d) => findLast(data, (p) => p[0] === d));
    }

    case "first": {
      return dates.map((d) => find(data, (p) => p[0] === d));
    }

    case "sum": {
      return dates.map((d) => {
        const r = (prev: number, p: Datapoint) => {
          return p[0] === d ? prev + p[1] : prev;
        };
        const sum = data.reduce(r, 0);
        return [d, sum, "aggregate"];
      });
    }

    case "min": {
      return dates.map((d) => {
        const min = data.reduce((prev: undefined | number, p: Datapoint) => {
          if (p[0] !== d) return prev;
          if (prev === undefined) return p[1];
          return p[1] < prev ? p[1] : prev;
        }, undefined) || 0;
        return [d, min, "aggregate"];
      });
    }

    case "max": {
      return dates.map((d) => {
        const min = data.reduce((prev: undefined | number, p: Datapoint) => {
          if (p[0] !== d) return prev;
          if (prev === undefined) return p[1];
          return p[1] > prev ? p[1] : prev;
        }, undefined) || 0;
        return [d, min, "aggregate"];
      });
    }

    default: {
      throw new Error("Unsupported aggday method!");
    }
  }
}

export default function aggregate(
    data: Datapoint[],
    method: Aggday
): Datapoint[] {
  const aggregated = getDirtyAggregates(data, method);

  return aggregated.filter((p): p is Datapoint => p !== undefined);
}
