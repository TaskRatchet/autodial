import * as functions from "firebase-functions";
import cron from "./cron";
// import * as admin from "firebase-admin"

const handler = async (): Promise<{statusCode: number, body: string}> => {
  // await cron();
  return {
    statusCode: 200,
    body: "cron success",
  };
};

export {handler};
