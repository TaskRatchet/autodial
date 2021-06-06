import * as functions from "firebase-functions";
import cron from "./cron";
// import * as admin from "firebase-admin"

export const dialFunc = functions.https.onRequest(() => {
  cron();
});
