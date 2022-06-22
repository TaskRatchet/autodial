import {Goal, GoalVerbose} from "./types";

export type AutodialSettings = {
  autodial: boolean,
  min: number,
  max: number,
  strict: boolean,
  add: number,
  from?: string,
  fromGoal?: GoalVerbose
}

export function getSettings(g: Goal): AutodialSettings {
  const text = `${g.fineprint} ${g.title}`;
  const minMatches = text.match(/#autodialMin=(-?\d*\.?\d+)/);
  const maxMatches = text.match(/#autodialMax=(-?\d*\.?\d+)/);
  const addMatches = text.match(/#autodialAdd=(-?\d*\.?\d+)/);
  const fromMatches = text.match(/#autodialFrom=(-?[\w-]+)/);
  const min = minMatches ? parseFloat(minMatches[1]) : -Infinity;
  const max = maxMatches ? parseFloat(maxMatches[1]) : Infinity;
  const add = addMatches ? parseFloat(addMatches[1]) : 0;
  const from = fromMatches ? fromMatches[1] : undefined;

  return {
    autodial: text.includes("#autodial") || false,
    min,
    max,
    strict: text.includes("#autodialStrict") || false,
    add,
    from,
  };
}
