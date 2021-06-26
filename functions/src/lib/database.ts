import admin from "firebase-admin";
import {firestore} from "firebase-admin/lib/firestore";
import Firestore = firestore.Firestore;
import QueryDocumentSnapshot = firestore.QueryDocumentSnapshot;
import DocumentData = firestore.DocumentData;

let _db: Firestore;

function getDb() {
  if (!_db) {
    admin.initializeApp();
    _db = admin.firestore();
  }

  return _db;
}

export async function getUsers(): Promise<User[]> {
  const {docs} = await getDb().collection("users").get();
  return docs.map((d: QueryDocumentSnapshot<DocumentData>) => d.data() as User);
}
