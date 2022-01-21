var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import React, { useEffect } from "react";
import "./App.css";
import { deleteUser, setUserAuth } from "./lib/database";
import { getParams } from "./lib/browser";
import { init } from "./lib/firebase";
import { Alert, Button, LinearProgress, Paper, Table, TableBody, TableCell, TableContainer, Container, TableHead, TableRow, } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { getGoalsVerbose, getSettings } from "../shared";
import { useIsFetching, useMutation, useQuery, } from "react-query";
import GoalRow from "./component/molecule/goalRow";
init();
function App() {
    var _this = this;
    var _a = process.env, _b = _a.REACT_APP_APP_URL, REACT_APP_APP_URL = _b === void 0 ? "" : _b, _c = _a.REACT_APP_BM_CLIENT_ID, REACT_APP_BM_CLIENT_ID = _c === void 0 ? "" : _c;
    var redirectUri = encodeURIComponent(REACT_APP_APP_URL);
    var params = getParams();
    var username = params.get("username");
    var accessToken = params.get("access_token");
    var disable = params.get("disable") === "true";
    var enableUrl = "https://www.beeminder.com/apps/authorize?client_id=".concat(REACT_APP_BM_CLIENT_ID, "&redirect_uri=").concat(redirectUri, "&response_type=token");
    var disableUrl = "/?access_token=".concat(accessToken, "&username=").concat(username, "&disable=true");
    var isFetching = useIsFetching();
    var _d = useQuery("goals", function () { return __awaiter(_this, void 0, void 0, function () {
        var goals;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!username || !accessToken)
                        return [2 /*return*/];
                    return [4 /*yield*/, getGoalsVerbose(username, accessToken)];
                case 1:
                    goals = _a.sent();
                    goals.sort(function (a, b) {
                        return a.slug.localeCompare(b.slug);
                    });
                    return [2 /*return*/, goals.filter(function (g) { return getSettings(g).autodial; })];
            }
        });
    }); }), goals = _d.data, error = _d.error, isError = _d.isError, isLoading = _d.isLoading, refetch = _d.refetch;
    var _e = useMutation("force", function () { return __awaiter(_this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("/.netlify/functions/cron")];
                case 1:
                    result = _a.sent();
                    console.log({ result: result });
                    return [4 /*yield*/, refetch()];
                case 2:
                    _a.sent();
                    return [2 /*return*/, result];
            }
        });
    }); }), forceRun = _e.mutate, forceStatus = _e.status, forceIsLoading = _e.isLoading;
    var forceMap = {
        "idle": { label: "Force Run" },
        "loading": { label: "Running..." },
        "error": { label: "Error" },
        "success": { label: "Success" },
    }[forceStatus];
    var isAuthenticated = username && accessToken && !disable && !isLoading &&
        !isError;
    useEffect(function () {
        if (!username || !accessToken || isLoading || isError)
            return;
        if (disable) {
            deleteUser(username);
        }
        else {
            setUserAuth(username, accessToken);
        }
    }, [username, accessToken, isLoading, isError]);
    return <Container className={"App"}>
    <h1>Beeminder Autodialer</h1>

    <Alert severity="warning">
      This tool is in beta and may contain bugs. Use at your own risk. If you
      encounter any bugs that are not documented
      in the known limitations section below, please report the issue to{" "}
      <a href="mailto:nathan@taskratchet.com">nathan@taskratchet.com</a>. Thank
      you!
    </Alert>

    <p>
      The Beeminder autodialer will automatically adjust the rate on your goals
      based on your historical
      performance.
    </p>

    <h2>Instructions</h2>

    <h3>Step 1: Connect the autodialer to your Beeminder account</h3>

    {error && <Alert severity="error">{error.message}</Alert>}
    {disable && error &&
            <Alert severity="error"><span>Unable to disable autodialer for Beeminder
        user {username}: Beeminder authentication failed.</span> Please <a href={enableUrl}>reauthenticate with Beeminder</a> and then try
        again.</Alert>}
    {disable && !isLoading && !error &&
            <Alert severity="success">The autodialer has been disabled for Beeminder
        user {username}</Alert>}

    {!isAuthenticated &&
            <LoadingButton variant={"contained"} color={"primary"} href={enableUrl} loading={isLoading}>Enable
        Autodialer</LoadingButton>}

    {isAuthenticated && <>
      <p>Connected Beeminder user: <strong><a href={"https://beeminder.com/".concat(username)} target={"_blank"} rel={"nofollow noreferrer"}>{username}</a></strong></p>
      <Button variant="outlined" color="secondary" href={disableUrl}>Disable
            Autodialer</Button>
    </>}

    <h3>Step 2: Configure specific goals to use the autodialer</h3>
    <p>Add one or more of the following three tags to the fineprint of the goals
      you wish to autodial:</p>

    <TableContainer component={Paper} variant="outlined">
      <Table size={"small"}>
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
            <TableCell>Enables autodialing and specifies the smallest rate the
              autodialer will set for the goal, in
              terms of your goal's current time unit.</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>#autodialMax=1</TableCell>
            <TableCell>Enables autodialing and specifies the largest rate the
              autodialer will set for the goal, in terms
              of your goal's current time unit.</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>

    {isAuthenticated && goals && <>
      <p>Here are your goals for which autodialing is enabled:</p>

      {isFetching ? <LinearProgress /> : null}

      <TableContainer component={Paper} variant="outlined">
        <Table size={"small"}>
          <TableHead>
            <TableRow>
              <TableCell>Slug</TableCell>
              <TableCell>#autodialMin=?</TableCell>
              <TableCell>#autodialMax=?</TableCell>
              <TableCell>Current Rate</TableCell>
              <TableCell>30d Unit Average</TableCell>
              <TableCell>Weekends Off</TableCell>
              <TableCell>Goal Age</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {goals.map(function (g) { return <GoalRow key={g.slug} goal={g} username={username}/>; })}
          </TableBody>
        </Table>
      </TableContainer>
    </>}

    <h3>Step 3: Use Beeminder as normal</h3>
    <p>
      Once a day at minimum, the autodialer will adjust the rates of your
      enabled goals to equal your average for the last 30 days.
    </p>

    <p>
      Or, if you don't feel like waiting, click this button to force the
      autodialer to run:
    </p>

    <LoadingButton variant={"outlined"} color={"secondary"} onClick={function () { return forceRun(); }} loading={forceIsLoading}>{forceMap.label}</LoadingButton>

    <h2>Known Issues & Limitations</h2>
    <ul>
      <li>
        Not all <a href="https://help.beeminder.com/article/97-custom-goals#aggday">aggregation
        methods</a> are
        supported. Unsupported methods include mode, trimmean, clocky, and
        skatesum.
      </li>
      <li>The aggregated value of a goal's initial day is considered the
        starting value of the road and does not
        otherwise influence dialing.
      </li>
      <li>
        This tool assumes the akrasia horizon is eight days instead of seven in
        order to avoid needing to take the
        user's timezone into account.
      </li>
      <li>
        Logging into the autodialer in one window will log you out in all
        other windows.
      </li>
      <li>
        The end state of a dialed goal will always be in terms of date and
        rate, regardless of how the goal's end was originally defined.
      </li>
    </ul>

    <h2>Acknowledgements</h2>
    <p>Special thanks to:</p>
    <ul>
      <li><a href="https://www.beeminder.com/aboutus">Mary Renaud, Dept. of
        Treasury at Beeminder</a>, for creating the
        original autodialer and sharing her invaluable advice during the
        development of this tool.
      </li>
      <li><a href="https://www.beeminder.com/aboutus">Daniel Reeves, co-founder
        & CEO of Beeminder</a>, for assisting
        with the specification and development of the tool.
      </li>
      <li><a href="https://www.beeminder.com/home">The Beeminder company</a> for
        permitting code from their codebase to
        be copied into this project.
      </li>
      <li><a href="https://icons8.com/">Icons8</a> for providing the favicon.
      </li>
    </ul>
    <p><a href="https://github.com/narthur/autodial">This open-source
      tool</a> is maintained by <a href="https://nathanarthur.com">Nathan Arthur</a>, <a href="https://beeminder.com">Beeminder</a> user and <a href="https://taskratchet.com">TaskRatchet</a> founder.</p>

  </Container>;
}
export default App;
