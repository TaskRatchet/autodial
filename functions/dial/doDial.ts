/* eslint-disable camelcase */
import {getGoal, getGoals, updateGoal} from "shared-library";
import getSettings from "shared-library/getSettings";
import log from "../cron/lib/log";
import dial from "shared-library/dial";

export default async function doDial(
    params: Record<string, string> | null
): Promise<void> {
  const {beeminder_user, beeminder_token} = params || {};

  if (!beeminder_user || !beeminder_token) {
    log("missing user auth");
    return;
  }

  const all = await getGoals(beeminder_user, beeminder_token);
  const toDial = all.filter((g: Goal) => getSettings(g).autodial);

  await Promise.all(toDial.map(async (g) => {
    log({m: `start dial goal ${g.slug}`, t: new Date()});
    try {
      const {min, max} = getSettings(g);
      const fullGoal = await getGoal(beeminder_user, beeminder_token, g.slug);
      const roadall = dial(fullGoal, {min, max});

      log({m: `end dial goal ${g.slug}`, t: new Date()});

      if (!roadall) return;

      await updateGoal(beeminder_user, beeminder_token, g.slug, {roadall});
    } catch (e) {
      log({m: "failed to dial goal", g, e});
      return;
    }
  }));
}
