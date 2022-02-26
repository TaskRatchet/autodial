import {getUser} from "../../src/lib";
import {removeUser} from "./database";

export default async function doRemove(
    user: string,
    token: string
): Promise<void> {
  await getUser(user, token);
  await removeUser(user);
}
