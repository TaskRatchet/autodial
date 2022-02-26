import {
  Paper,
  Table, TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import GoalRow from "../molecule/goalRow";
import React from "react";
import {GoalVerbose} from "../../lib";

type Props = { goals: GoalVerbose[], username: string };

export default function GoalsTable({
  goals,
  username,
}: Props): JSX.Element {
  return <TableContainer component={Paper} variant="outlined">
    <Table size={"small"}>
      <TableHead>
        <TableRow>
          <TableCell>Slug</TableCell>
          <TableCell>#autodialMin=?</TableCell>
          <TableCell>#autodialMax=?</TableCell>
          <TableCell>#autodialStrict</TableCell>
          <TableCell>Rate</TableCell>
          <TableCell>30d Average</TableCell>
          <TableCell>Weekends Off</TableCell>
          <TableCell>Age</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {goals.map((g) => <GoalRow
          key={g.slug}
          goal={g}
          username={username}
        />)}
      </TableBody>
    </Table>
  </TableContainer>;
}
