import {getUsers} from "./database";
import log from "../../src/lib/log";
import {
  getGoal,
  getGoals,
  updateGoal,
  dial,
  Goal,
  getSettings, now, SID,
} from "../../src/lib";

/* eslint-disable camelcase */

const doCron = async (): Promise<void> => {
  const isDev = process.env.FUNCTIONS_EMULATOR === "true";

  log(isDev);

  const users = await getUsers();

  await Promise.all(users.map(async ({beeminder_user, beeminder_token}) => {
    if (!beeminder_user || !beeminder_token) {
      log("missing user auth");
      return;
    }

    try {
      const all = await getGoals(beeminder_user, beeminder_token);
      const toDial = all.filter((g: Goal) => getSettings(g).autodial);

      await Promise.all(toDial.map(async (g) => {
        log(`start dial goal ${beeminder_user}/${g.slug}`);
        try {
          const settings = getSettings(g);
          const diffSince = now() - (SID * 31);
          const fullGoal = await getGoal(
              beeminder_user,
              beeminder_token,
              g.slug,
              diffSince,
          );
          settings.fromGoal = settings.from && await getGoal(
              beeminder_user, beeminder_token, settings.from, diffSince
          ) || undefined;
          const roadall = dial(fullGoal, settings);
          const newRate = roadall && roadall[roadall.length - 1][2];
          const id = `${beeminder_user}/${g.slug}`;

          log(`end dial goal ${id}: ${newRate}`);

          if (!roadall) return;

          if (!isDev) {
            await updateGoal(
                beeminder_user,
                beeminder_token,
                g.slug,
                {roadall}
            );
          }
        } catch (e) {
          log({m: "failed to dial goal", g, e});
        }
      }));
    } catch (e) {
      log({m: "failed to handle user", beeminder_user, e});
    }
  }));
};

export default doCron;
