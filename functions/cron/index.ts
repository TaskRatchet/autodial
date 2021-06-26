import * as functions from "firebase-functions";
import cron from "./cron";
import {Handler} from "@netlify/functions";
// import * as admin from "firebase-admin"

const handler: Handler = async () => {
  // await cron();
  return {
    statusCode: 200,
    body: "cron success",
  };
};

export {handler};
