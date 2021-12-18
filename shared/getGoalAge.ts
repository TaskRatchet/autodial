import {now} from "./time";

export default function getGoalAge(g: GoalVerbose): number {
  const firstRow = g.roadall[0];

  if (!firstRow[0]) {
    throw new Error("Goal road has no initial daystamp!");
  }

  return now() - firstRow[0];
}
