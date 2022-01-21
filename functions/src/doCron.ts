import {getUsers} from "./database";
import log from "./log";
import {getGoal, getGoals, updateGoal, dial, Goal} from "../../shared";
import {getSettings} from "../../shared";

/* eslint-disable camelcase */

export default async function doCron(): Promise<void> {
  const users = await getUsers();

  await Promise.all(users.map(async ({beeminder_user, beeminder_token}) => {
    if (!beeminder_user || !beeminder_token) {
      log("missing user auth");
      return;
    }

    getGoals(beeminder_user, beeminder_token).then((all) => {
      const toDial = all.filter((g: Goal) => getSettings(g).autodial);

      toDial.forEach(async (g) => {
        log({m: `start dial goal ${g.slug}`, t: new Date()});
        try {
          const {min, max} = getSettings(g);
          const fullGoal = await getGoal(
              beeminder_user,
              beeminder_token,
              g.slug
          );
          const roadall = dial(fullGoal, {min, max});

          log({m: `end dial goal ${g.slug}`, t: new Date()});

          if (!roadall) return;

          await updateGoal(beeminder_user, beeminder_token, g.slug, {roadall});
        } catch (e) {
          log({m: "failed to dial goal", g, e});
        }
      });
    });
  }));
}
