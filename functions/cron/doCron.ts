/* eslint-disable camelcase */
import {getUsers} from "./lib/database";
import fetch from "node-fetch";

export default async function doCron(e: {rawUrl: string}): Promise<void> {
  const users = await getUsers();

  users.forEach(({beeminder_user, beeminder_token}) => {
    const url = new URL(e.rawUrl);
    fetch(`https://${url.hostname}/.netlify/functions/dial?beeminder_user=${beeminder_user}&beeminder_token=${beeminder_token}`);
  });
}
