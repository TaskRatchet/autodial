// import * as functions from "firebase-functions";
// import doCron from "./doCron";
import {Handler} from "@netlify/functions";
// import * as admin from "firebase-admin"

const handler: Handler = async () => {
  // await doCron();
  return {
    statusCode: 200,
    body: "cron success",
  };
};

export {handler};
