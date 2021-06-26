import * as functions from "firebase-functions";
import cron from "./cron";
// import * as admin from "firebase-admin"

export const handler = async (): Promise<string> => {
  // await cron();
  return "cron success";
};

