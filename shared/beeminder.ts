import fetch from "node-fetch";
import axios from "axios";

export async function getGoalsVerbose(
    user: string,
    token: string,
): Promise<GoalVerbose[]> {
  const goals = await getGoals(user, token);
  return Promise.all(goals.map((g) => getGoal(user, token, g.slug)));
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
): Promise<GoalVerbose> {
  const url = `https://www.beeminder.com/api/v1/users/${user}/goals/${slug}.json?access_token=${token}&datapoints=true`;
  const response = await fetch(url);
  const data = await response.json();

  if (data?.errors) {
    throw new Error(data.errors.message);
  }

  return data;
}

export async function updateGoal(
    user: string,
    token: string,
    slug: string,
    fields: {roadall: Roadall}
): Promise<Omit<Goal, "datapoints">> {
  const url = `https://www.beeminder.com/api/v1/users/${user}/goals/${slug}.json`;
  const putData = {
    ...fields,
    roadall: JSON.stringify(fields.roadall),
  };
  const response = await axios.put(`${url}?access_token=${token}`, putData);

  console.log({user, token, slug, url, putData, fields, response});

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
