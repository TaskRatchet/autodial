import { TableCell, TableRow } from "@mui/material";
import { getRollingAverageRate, UNIT_SECONDS, getGoalAge, getSettings } from "../../../shared";
import React from "react";
import moment from "moment";
export default function GoalRow(_a) {
    var goal = _a.goal, username = _a.username;
    var settings = getSettings(goal);
    var min = settings.min === -Infinity ?
        "Negative Infinity" : "".concat(settings.min, "/").concat(goal.runits);
    var max = settings.max === Infinity ?
        "Positive Infinity" : "".concat(settings.max, "/").concat(goal.runits);
    var arps = getRollingAverageRate(goal);
    var arpn = arps * UNIT_SECONDS[goal.runits];
    var formattedAverage = arpn.toFixed(2).replace(/\.0+$/, "");
    var rate = goal.mathishard[2];
    var formattedRate = rate.toFixed(2).replace(/\.0+$/, "");
    return <TableRow>
    <TableCell><a href={"https://beeminder.com/".concat(username, "/").concat(goal.slug)} target={"_blank"} rel={"nofollow noreferrer"}>{goal.slug}</a></TableCell>
    <TableCell>{min}</TableCell>
    <TableCell>{max}</TableCell>
    <TableCell>{formattedRate}/{goal.runits}</TableCell>
    <TableCell>{formattedAverage}/{goal.runits}</TableCell>
    <TableCell>{goal.weekends_off ? "yes" : "no"}</TableCell>
    <TableCell>{moment.duration(getGoalAge(goal) * 1000).humanize()}</TableCell>
  </TableRow>;
}
