export async function getGoals(user: string, token: string): Promise<Goal[]> {
  const url = `https://www.beeminder.com/api/v1/users/${user}/goals.json?access_token=${token}&filter=frontburner`;
  const response = await fetch(url);
  const data = await response.json();

  if (data?.errors) {
    throw new Error(data.errors.message);
  }

  return data;
}
