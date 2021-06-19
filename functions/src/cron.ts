import {getUsers} from "./lib/database";
import {getGoals} from "./lib/beeminder";

export default async function cron(): Promise<void> {
  const users = await getUsers() || [];

  users.forEach((u) => {
    getGoals(u.beeminder_user, u.beeminder_token);
  });
}
