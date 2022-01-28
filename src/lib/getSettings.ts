import {Goal} from "./types";

export type AutodialSettings = {
  autodial: boolean,
  min: number,
  max: number,
}

export function getSettings(g: Goal): AutodialSettings {
  const minMatches = g.fineprint?.match(/#autodialMin=(-?\d*\.?\d+)/);
  const maxMatches = g.fineprint?.match(/#autodialMax=(-?\d*\.?\d+)/);
  const min = minMatches ? parseFloat(minMatches[1]) : -Infinity;
  const max = maxMatches ? parseFloat(maxMatches[1]) : Infinity;

  return {
    autodial: g.fineprint?.includes("#autodial") || false,
    min,
    max,
  };
}
