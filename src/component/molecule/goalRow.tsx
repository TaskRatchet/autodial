import {TableCell, TableRow} from "@material-ui/core";
import getRollingAverageRate from "shared-library/getRollingAverageRate";
import React from "react";
import {UNIT_SECONDS} from "shared-library/constants";
import getGoalAge from "shared-library/getGoalAge";
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
  const minMatches = goal.fineprint?.match(/#autodialMin=(\d+)/);
  const maxMatches = goal.fineprint?.match(/#autodialMax=(\d+)/);
  const min = minMatches ?
    `${minMatches[1]}/${goal.runits}` : "Negative Infinity";
  const max = maxMatches ?
    `${maxMatches[1]}/${goal.runits}` : "Positive Infinity";
  const arps = getRollingAverageRate(goal);
  const arpn = arps * UNIT_SECONDS[goal.runits];
  const formattedAverage = arpn.toFixed(2).replace(/\.0+$/, "");
  const formattedRate = goal.rate.toFixed(2).replace(/\.0+$/, "");
  return <TableRow>
    <TableCell><a
      href={`https://beeminder.com/${username}/${goal.slug}`}
      target={"_blank"}
      rel={"nofollow noreferrer"}>{goal.slug}</a></TableCell>
    <TableCell>{min}</TableCell>
    <TableCell>{max}</TableCell>
    <TableCell>{formattedRate}/{goal.runits}</TableCell>
    <TableCell>{formattedAverage}/{goal.runits}</TableCell>
    <TableCell>{moment.duration(getGoalAge(goal) * 1000).humanize()}</TableCell>
  </TableRow>;
}
