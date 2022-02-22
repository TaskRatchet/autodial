import {Goal} from "./types";

export type AutodialSettings = {
  autodial: boolean,
  min: number,
  max: number,
  strict: boolean,
}

export function getSettings(g: Goal): AutodialSettings {
  const text = `${g.fineprint} ${g.title}`;
  const minMatches = text.match(/#autodialMin=(-?\d*\.?\d+)/);
  const maxMatches = text.match(/#autodialMax=(-?\d*\.?\d+)/);
  const min = minMatches ? parseFloat(minMatches[1]) : -Infinity;
  const max = maxMatches ? parseFloat(maxMatches[1]) : Infinity;

  return {
    autodial: text.includes("#autodial") || false,
    min,
    max,
    strict: text.includes("#autodialStrict") || false,
  };
}
