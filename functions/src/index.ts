import * as functions from "firebase-functions";
import dial from "./dial";
// import * as admin from "firebase-admin"

export const dialFunc = functions.https.onRequest(() => {
  dial();
});
