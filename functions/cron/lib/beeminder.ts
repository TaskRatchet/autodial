import fetch from "node-fetch";

export async function getGoals(
    user: string,
    token: string,
): Promise<Omit<Goal, "datapoints">[]> {
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
): Promise<Goal> {
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
    {roadall}: {roadall: Roadall}
): Promise<Omit<Goal, "datapoints">> {
  const url = `https://www.beeminder.com/api/v1/users/${user}/goals/${slug}.json`;
  const options = {
    method: "post",
    body: JSON.stringify({
      access_token: token,
      roadall,
    }),
  };
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Fetch error: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();

  if (data?.errors) {
    throw new Error(data.errors.message);
  }

  return data;
}
