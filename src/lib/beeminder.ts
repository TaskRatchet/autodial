import fetch from "node-fetch";
import axios from "axios";
import {GoalVerbose, Goal, Roadall} from "./index";

export async function getGoalsVerbose(
    user: string,
    token: string,
    diffSince: number,
): Promise<GoalVerbose[]> {
  const goals = await getGoals(user, token);
  const results = await Promise.allSettled(goals.map((g) => {
    return getGoal(user, token, g.slug, diffSince);
  }));
  return results.flatMap((r) => {
    if (r.status === "fulfilled") {
      return [r.value];
    } else {
      console.log(r);
      return [];
    }
  });
}

export async function getGoals(
    user: string,
    token: string,
): Promise<Goal[]> {
  const url = `https://www.beeminder.com/api/v1/users/${user}/goals.json?access_token=${token}&filter=frontburner`;
  const response = await fetch(url);
  const data = await response.json();

  if (data?.errors) {
    throw new Error(data.errors.message);
  }

  return data;
}

export async function getGoal(
    user: string,
    token: string,
    slug: string,
    diffSince: number,
): Promise<GoalVerbose> {
  const url = `https://www.beeminder.com/api/v1/users/${user}/goals/${slug}.json?access_token=${token}&diff_since=${diffSince}&datapoints=true`;
  const response = await fetch(url);
  const data = await response.json();

  if (data?.errors) {
    throw new Error(data.errors.message);
  }

  return data;
}

export async function getUser(user: string, token: string): Promise<unknown> {
  const url = `https://www.beeminder.com/api/v1/users/${user}.json`;
  const response = await axios.get(`${url}?access_token=${token}`);

  if (response.status !== 200) {
    const msg =
      `Fetch error: ${response.status} - ${response.statusText} - ${url}`;
    throw new Error(msg);
  }

  if (response.data?.errors) {
    throw new Error(response.data.errors.message);
  }

  return response.data;
}

export async function updateGoal(
    user: string,
    token: string,
    slug: string,
    fields: {roadall: Roadall},
): Promise<Omit<Goal, "datapoints">> {
  const url = `https://www.beeminder.com/api/v1/users/${user}/goals/${slug}.json`;
  const putData = {
    ...fields,
    roadall: JSON.stringify(fields.roadall),
  };
  const response = await axios.put(`${url}?access_token=${token}`, putData);

  if (response.status !== 200) {
    const msg =
      `Fetch error: ${response.status} - ${response.statusText} - ${url}`;
    throw new Error(msg);
  }

  if (response.data?.errors) {
    throw new Error(response.data.errors.message);
  }

  return response.data;
}
