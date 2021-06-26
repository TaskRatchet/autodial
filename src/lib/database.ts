import firebase from "firebase/app";
import "firebase/firestore";

let _db: firebase.firestore.Firestore | undefined;

function getDb() {
  if (!_db) _db = firebase.firestore();

  return _db;
}

export async function setUserAuth(
    bmUser: string,
    bmToken: string,
): Promise<void> {
  return getDb().collection("users").doc(bmUser).set({
    "beeminder_user": bmUser,
    "beeminder_token": bmToken,
  });
}

export async function deleteUser(bmUser: string): Promise<void> {
  return getDb().collection("users").doc(bmUser).delete();
}
