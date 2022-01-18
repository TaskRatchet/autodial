/* eslint-disable camelcase */
import {getUsers} from "./lib/database";
import fetch from "node-fetch";

export default async function doCron(): Promise<void> {
  const users = await getUsers();

  await Promise.all(users.map(async ({beeminder_user, beeminder_token}) => {
    await fetch(`https://autodial.taskratchet.com/.netlify/functions/dial?beeminder_user=${beeminder_user}&beeminder_token=${beeminder_token}`);
  }));
}
