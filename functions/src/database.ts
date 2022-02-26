import admin, {firestore} from "firebase-admin";
import {User} from "../../src/lib";
import QueryDocumentSnapshot = firestore.QueryDocumentSnapshot;
import WriteResult = firestore.WriteResult;

admin.initializeApp();

export async function getUsers(): Promise<User[]> {
  const {docs} = await admin.firestore().collection("users").get();
  return docs.map((d: QueryDocumentSnapshot) => d.data() as User);
}

export async function updateUser(
    user: string,
    token: string
): Promise<WriteResult> {
  return admin.firestore().collection("users").doc(user).set({
    "beeminder_user": user,
    "beeminder_token": token,
  });
}

export async function removeUser(
    user: string,
): Promise<WriteResult> {
  return admin.firestore().collection("users").doc(user).delete();
}
