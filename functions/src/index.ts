import * as functions from "firebase-functions";
import doCron from "./doCron";
import doUpdate from "./doUpdate";
import doRemove from "./doRemove";


// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

async function withOptions(
    func: () => Promise<void>,
    req: functions.Request,
    res: functions.Response
) {
  res.set("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
  } else {
    try {
      await func();
      res.status(200).send("Success");
    } catch {
      res.status(500).send("Error");
    }
  }
}

export const cron = functions.runWith({
  timeoutSeconds: 540,
}).https.onRequest(async (req: functions.Request, res: functions.Response) => {
  await withOptions(doCron, req, res);
});

export const update = functions.https.onCall(async (
    data
) => {
  await doUpdate(
      data.user,
      data.token
  );
});

export const remove = functions.https.onCall(async (
    data
) => {
  await doRemove(
      data.user,
      data.token
  );
});
