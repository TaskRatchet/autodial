import * as functions from "firebase-functions";
import doCron from "./doCron";


// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const cron = functions.runWith({
  timeoutSeconds: 540,
}).https.onRequest(async (req: functions.Request, res: functions.Response) => {
  await doCron(req, res);
});
