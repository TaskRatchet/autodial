import admin, {firestore} from "firebase-admin";
import {User} from "../../src/lib";
import QueryDocumentSnapshot = firestore.QueryDocumentSnapshot;

admin.initializeApp();

export async function getUsers(): Promise<User[]> {
  const {docs} = await admin.firestore().collection("users").get();
  return docs.map((d: QueryDocumentSnapshot) => d.data() as User);
}
