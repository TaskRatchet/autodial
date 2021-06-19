import React from "react";
import "./App.css";
import {deleteUser, setUserAuth} from "./lib/database";
import {getParams} from "./lib/browser";
import {useEffect} from "react";
import {init} from "./lib/firebase";
import Container from "@material-ui/core/Container";
import {Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@material-ui/core";
import {getGoals} from "./lib/beeminder";
import Alert from "@material-ui/lab/Alert";
import {useQuery, UseQueryResult} from "react-query";

init();

type Goals = Goal[]
type GoalsError = Error

function App() {
  const {REACT_APP_APP_URL = "", REACT_APP_BM_CLIENT_ID = ""} = process.env;
  const redirectUri = encodeURIComponent(REACT_APP_APP_URL);
  const params = getParams();
  const username = params.get("username");
  const accessToken = params.get("access_token");
  const disable: boolean = params.get("disable") === "true";
  const enableUrl = `https://www.beeminder.com/apps/authorize?client_id=${REACT_APP_BM_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=token`;
  const disableUrl = `/?access_token=${accessToken}&username=${username}&disable=true`;
  const {
    data: goals,
    error,
    isError,
    isLoading,
  }: UseQueryResult<Goals, GoalsError> = useQuery("goals", async () => {
    if (!username) return;
    const goals = await getGoals(username, accessToken);
    goals.sort(function(a: Goal, b: Goal) {
      return a.slug.localeCompare(b.slug);
    });
    return goals.filter((g: Goal) => !!g.fineprint?.includes("#autodial"));
  });
  const isAuthenticated = username && !disable && !isLoading && !isError;

  useEffect(() => {
      if (!username || !accessToken || isLoading || isError) return;

      if (disable) {
        deleteUser(username)
      } else {
        setUserAuth(username, accessToken);
      }
    },
    [username, accessToken, isLoading, isError, disable]);

  return <Container className={"App"}>
    <h1>Beeminder Autodialer</h1>
    <p>
      The Beeminder autodialer will automatically adjust the rate on your goals based on your historical
      performance.
    </p>

    <h2>Instructions</h2>

    <h3>Step 1: Connect the autodialer to your Beeminder account</h3>

    {error && <Alert severity="error">{error.message}</Alert>}
    {disable && error && <Alert severity="error"><span>Unable to disable autodialer for Beeminder user {username}: Beeminder authentication failed.</span> Please <a
        href={enableUrl}>reauthenticate with Beeminder</a> and then try again.</Alert>}
    {disable && !isLoading && !error && <Alert severity="success">The autodialer has been disabled for Beeminder user {username}</Alert>}

    {isLoading && <p>loading...</p>}

    {!isAuthenticated && !isLoading && <p>
        <Button variant={"contained"} color={"primary"} href={enableUrl}>Enable Autodialer</Button>
    </p>}

    {isAuthenticated && <>
      <p>Connected Beeminder user: <strong><a href={`https://beeminder.com/${username}`} target={'_blank'} rel={'nofollow noreferrer'}>{username}</a></strong></p>
      <Button variant="contained" color="secondary" href={disableUrl}>Disable Autodialer</Button>
    </>}

    <h3>Step 2: Configure specific goals to use the autodialer</h3>
    <p>Add one or more of the following three tags to the fineprint of the goals you wish to autodial:</p>
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
            <TableCell>Enables autodialing and specifies the smallest rate the autodialer will set for the goal, in terms of your goal's current time unit.</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>#autodialMax=1</TableCell>
            <TableCell>Enables autodialing and specifies the largest rate the autodialer will set for the goal, in terms of your goal's current time unit.</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>

    {isAuthenticated && goals && <>
        <p>Here are your goals for which autodialing is enabled:</p>

        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Slug</TableCell>
                        <TableCell>#autodialMin=?</TableCell>
                        <TableCell>#autodialMax=?</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                  {goals.map((g) => {
                    const minMatches = g.fineprint?.match(/#autodialMin=(\d+)/);
                    const maxMatches = g.fineprint?.match(/#autodialMax=(\d+)/);
                    const min = minMatches ? `${minMatches[1]}/${g.runits}` : "Negative Infinity"
                    const max = maxMatches ? `${maxMatches[1]}/${g.runits}` : "Positive Infinity"
                    return <TableRow key={g.slug}>
                      <TableCell><a href={`https://beeminder.com/${username}/${g.slug}`} target={'_blank'} rel={'nofollow noreferrer'}>{g.slug}</a></TableCell>
                      <TableCell>{min}</TableCell>
                      <TableCell>{max}</TableCell>
                    </TableRow>;
                  })}
                </TableBody>
            </Table>
        </TableContainer>
    </>}

    <h3>Step 3: Use Beeminder as normal</h3>
    <p>
      Once a day, the autodialer will adjust the rates of your enabled goals to equal your
      average for the last 30 days. Any goals with less than 30 days of history will not be
      autodialed.
    </p>

    <h2>Known Issues & Limitations</h2>
    <ul>
      <li>
        Not all <a href="https://help.beeminder.com/article/97-custom-goals#aggday">aggregation methods</a> are
        supported. Unsupported methods include mode, trimmean, clocky, and skatesum.
      </li>
      <li>The aggregated value of a goal's initial day is considered the starting value of the road and does not
        otherwise influence dialing.
      </li>
      <li>Goals will not be dialed until they have at least 30 days of history.</li>
    </ul>
  </Container>;
}

export default App;
