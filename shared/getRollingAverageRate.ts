import {now, parseDate} from "./time";
import stepify from "./stepify";
import aggregate from "./aggregate";
import {SID, UNIT_SECONDS} from "./constants";

// Take list of datapoints and a window (in seconds), return average rate in
// that window.
function avgrate(data: Datapoint[], window: number): number {
  if (!data || !data.length) return 0;

  // convert daystamps to unixtimes
  const unixData: UnixDatapoint[] = data.map((p) => {
    return [parseDate(p.daystamp), p.value];
  });

  // now we can stepify the data and get a data function, df, that maps any
  // unixtime to the most recent y-value as of that unixtime:
  const df = stepify(unixData); // df is the data function
  const preTime = now() - window - 1;
  const valNow = df(now());
  const valBefore = df(preTime);
  const vdelta = valNow - valBefore;

  return vdelta / window;
}

function autoSum(data: Datapoint[]): Datapoint[] {
  return data.reduce((prev: Datapoint[], p) => {
    const last = prev[prev.length - 1];
    const sum = last ? last.value + p.value : p.value;
    return [...prev, {...p, value: sum}];
  }, []);
}

// TODO: Accept per-period; default to second
export default function getRollingAverageRate(g: GoalVerbose): number {
  const aggregatedPoints = aggregate(g.datapoints, g.aggday);
  const summed = g.kyoom ? autoSum(aggregatedPoints) : aggregatedPoints;

  return avgrate(summed, SID * 30); // avg rate per second
}
