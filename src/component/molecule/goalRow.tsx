import {TableCell, TableRow} from "@mui/material";
import {
  AutodialSettings,
  dial,
  getGoalAge,
  getRollingAverageRate,
  getSettings,
  GoalVerbose,
  UNIT_SECONDS,
} from "../../lib";
import React, {useEffect, useState} from "react";
import moment from "moment";
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";

function fn(n: number): string {
  return n.toFixed(2).replace(/\.0+$/, "");
}

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
  const [settings, setSettings] = useState<AutodialSettings>();
  const [pendingRate, setPendingRate] = useState<false|number>(false);
  const [arpn, setArpn] = useState<number>();

  useEffect(() => {
    const options = getSettings(goal);
    const newRoad = dial(goal, options);
    const newRate = newRoad && newRoad[newRoad.length - 1][2];
    const arps = getRollingAverageRate(goal);
    const arpn = arps * UNIT_SECONDS[goal.runits];

    setSettings(options);
    setPendingRate(newRate === null ? false : newRate);
    setArpn(arpn);
  }, [goal]);

  const min = settings?.min === -Infinity ?
    "Negative Infinity" : `${settings?.min}/${goal.runits}`;
  const max = settings?.max === Infinity ?
    "Positive Infinity" : `${settings?.max}/${goal.runits}`;


  const rate = goal.mathishard[2];

  return <TableRow>
    <TableCell><a
      href={`https://beeminder.com/${username}/${goal.slug}`}
      target={"_blank"}
      rel={"nofollow noreferrer"}>{goal.slug}</a></TableCell>
    <TableCell>{min}</TableCell>
    <TableCell>{max}</TableCell>
    <TableCell>
      {fn(rate)}/{goal.runits}
      {pendingRate && <>
        <DoubleArrowIcon
          aria-label={"pending change"}
          fontSize={"inherit"}
          sx={{pl: 1, pr: 1}}
        />
        <span>{fn(pendingRate)}/{goal.runits}</span>
      </>}
    </TableCell>
    <TableCell>{arpn !== undefined && `${fn(arpn)}/${goal.runits}`}</TableCell>
    <TableCell>{goal.weekends_off ? "yes" : "no"}</TableCell>
    <TableCell>{moment.duration(getGoalAge(goal) * 1000).humanize()}</TableCell>
  </TableRow>;
}
