import doDial from "./doDial";
import {Handler} from "@netlify/functions";

const handler: Handler = async ({queryStringParameters}) => {
  await doDial(queryStringParameters);
  return {
    statusCode: 200,
    body: "dial success",
  };
};

export {handler};
