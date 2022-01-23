import {TableCell, TableRow} from "@mui/material";
import {getRollingAverageRate, GoalVerbose, UNIT_SECONDS, getGoalAge, getSettings} from "../../lib";
import React from "react";
import moment from "moment";

interface Props {
  goal: GoalVerbose,
  username: string
}

export default function GoalRow(
    {
      goal,
      username,
    }: Props,
): JSX.Element {
  const settings = getSettings(goal);
  const min = settings.min === -Infinity ?
    "Negative Infinity" : `${settings.min}/${goal.runits}`;
  const max = settings.max === Infinity ?
     "Positive Infinity" : `${settings.max}/${goal.runits}`;

  const arps = getRollingAverageRate(goal);
  const arpn = arps * UNIT_SECONDS[goal.runits];
  const formattedAverage = arpn.toFixed(2).replace(/\.0+$/, "");
  const rate = goal.mathishard[2];
  const formattedRate = rate.toFixed(2).replace(/\.0+$/, "");
  return <TableRow>
    <TableCell><a
      href={`https://beeminder.com/${username}/${goal.slug}`}
      target={"_blank"}
      rel={"nofollow noreferrer"}>{goal.slug}</a></TableCell>
    <TableCell>{min}</TableCell>
    <TableCell>{max}</TableCell>
    <TableCell>{formattedRate}/{goal.runits}</TableCell>
    <TableCell>{formattedAverage}/{goal.runits}</TableCell>
    <TableCell>{goal.weekends_off ? "yes" : "no"}</TableCell>
    <TableCell>{moment.duration(getGoalAge(goal) * 1000).humanize()}</TableCell>
  </TableRow>;
}
