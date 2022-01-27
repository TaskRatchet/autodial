import * as functions from "firebase-functions";
import doCron from "./doCron";


// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const cron = functions.runWith({
  timeoutSeconds: 540,
}).https.onRequest(async (req: functions.Request, res: functions.Response) => {
  res.set("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
  } else {
    await doCron();
    res.status(200).send("Success");
  }
});
