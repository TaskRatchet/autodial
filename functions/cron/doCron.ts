import {getUsers} from "./lib/database";
import {getGoal, getGoals, updateGoal} from "shared-library";
import dial from "../../shared/dial";
import log from "./lib/log";
import getSettings from "shared-library/getSettings";

export default async function doCron(): Promise<void> {
  const users = await getUsers();

  // eslint-disable-next-line camelcase
  await Promise.all(users.map(async ({beeminder_user, beeminder_token}) => {
    const all = await getGoals(beeminder_user, beeminder_token);
    const toDial = all.filter((g: Goal) => getSettings(g).autodial);

    await Promise.all(toDial.map(async (g) => {
      try {
        const {min, max} = getSettings(g);
        const fullGoal = await getGoal(beeminder_user, beeminder_token, g.slug);
        const roadall = dial(fullGoal, {min, max});

        if (!roadall) return;

        await updateGoal(beeminder_user, beeminder_token, g.slug, {roadall});
      } catch (e) {
        log({m: "failed to dial goal", g, e});
        return;
      }
    }));
  }));
}
