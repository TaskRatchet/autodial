import doCron from "./doCron";
import {Handler} from "@netlify/functions";

const handler: Handler = async (e, c) => {
  console.log({e, c});
  await doCron();
  return {
    statusCode: 200,
    body: "cron success",
  };
};

export {handler};
