export async function getGoals(
    user: string,
    token: string,
): Promise<Goal[]> {
  const url = `https://www.beeminder.com/api/v1/users/${user}/goals.json?access_token=${token}&filter=frontburner&datapoints=true`;
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
): Promise<Goal> {
  const url = `https://www.beeminder.com/api/v1/users/${user}/goals/${slug}.json`;
  const options = {
    method: "post",
    body: JSON.stringify({
      access_token: token,
      roadall,
    }),
  };
  const response = await fetch(url, options);
  const data = await response.json();

  if (data?.errors) {
    throw new Error(data.errors.message);
  }

  return data;
}
