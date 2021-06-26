import {getUsers} from "./lib/database";
import {getGoals, updateGoal} from "./lib/beeminder";
import dial from "./lib/dial";

export default async function cron(): Promise<void> {
  const users = await getUsers();

  await Promise.all(users.map(async (u) => {
    const all = await getGoals(u.beeminder_user, u.beeminder_token);
    const toDial = all.filter((g: Goal) => g.fineprint.includes("#autodial"));

    await Promise.all(toDial.map(async (g) => {
      const minMatches = g.fineprint.match(/#autodialMin=(\d+)/);
      const maxMatches = g.fineprint.match(/#autodialMax=(\d+)/);
      const min = minMatches ? parseInt(minMatches[1]) : undefined;
      const max = maxMatches ? parseInt(maxMatches[1]) : undefined;
      const roadall = dial(g, {min, max});

      await updateGoal(u.beeminder_user, u.beeminder_token, g.slug, {roadall});
    }));
  }));
}
