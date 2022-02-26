import firebase from "firebase/app";
import "firebase/functions";
import HttpsCallableResult = firebase.functions.HttpsCallableResult;

export function update(
    user: string,
    token: string,
): Promise<HttpsCallableResult> {
  const update = firebase.functions().httpsCallable("update");
  return update({user, token});
}

export function remove(
    user: string,
    token: string,
): Promise<HttpsCallableResult> {
  const remove = firebase.functions().httpsCallable("remove");
  return remove({user, token});
}
