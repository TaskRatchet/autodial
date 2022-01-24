import * as functions from "firebase-functions";
import doCron from "./doCron";


// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const cron = functions.https.onRequest(async () => {
  await doCron();
});
