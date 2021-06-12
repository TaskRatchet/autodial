import React from "react";
import "./App.css";
import {setUserAuth} from "./lib/database";
import {getParams} from "./lib/browser";
import {useEffect} from "react";
import {init} from "./lib/firebase";
import Container from "@material-ui/core/Container";
import {Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@material-ui/core";

init();

function App() {
  const {REACT_APP_APP_URL = "", REACT_APP_BM_CLIENT_ID = ""} = process.env;
  const redirectUri = encodeURIComponent(REACT_APP_APP_URL);
  const url = `https://www.beeminder.com/apps/authorize?client_id=${REACT_APP_BM_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=token`;
  const params = getParams();
  const username = params.get("username");
  const accessToken = params.get("access_token");

  useEffect(() => {
      if (!username || !accessToken) return;

      setUserAuth(username,
        accessToken).then(() => {
        // TODO: handle then
        console.log("persist auth token success");
      }).catch((e) => {
        // TODO: handle catch
        // What should we do? Re-throw? Display the error?
        console.log("persist auth token failure");
        console.log(e);
      });
    },
    [username, accessToken]);

  return <Container className={"App"}>
    <h1>Beeminder Autodialer</h1>
    <p>
      The Beeminder autodialer will automatically adjust the rate on your goals based on your historical
      performance.
    </p>

    <h2>Step 1: Connect the autodialer to your Beeminder account</h2>
    <p><Button variant={"contained"} color={"primary"} href={url}>Enable Autodialer</Button></p>

    <h2>Step 2: Configure specific goals to use the autodialer</h2>
    <p>Add these tags to the fineprint of the goals you wish to autodial:</p>
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Tag</TableCell>
            <TableCell>Effect</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>#autodial</TableCell>
            <TableCell>Enables autodialing for goal</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>#autodialMin=1</TableCell>
            <TableCell>Optional. Specifies the smallest rate the autodialer will set for the goal.</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>#autodialMax=1</TableCell>
            <TableCell>Optional. Specifies the largest rate the autodialer will set for the goal.</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>

    <h2>Step 3: Use Beeminder as normal</h2>
    <p>
      Once a day, the autodialer will adjust the rates of your enabled goals to equal your
      average for the last 30 days. Any goals with less than 30 days of history will not be
      autodialed.
    </p>
  </Container>;
}

export default App;
