import doCron from "./doCron";
import {Handler} from "@netlify/functions";

const handler: Handler = async (e) => {
  await doCron(e);
  return {
    statusCode: 200,
    body: "cron success",
  };
};

export {handler};
