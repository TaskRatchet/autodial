import {useMutation, UseMutationResult} from "react-query";
import {update} from "./functions";
import firebase from "firebase";
import HttpsCallableResult = firebase.functions.HttpsCallableResult;

type UpdateProps = { user: string, token: string };
type ReturnType = UseMutationResult<
  HttpsCallableResult, {message: string}, UpdateProps>;

export default function useUpdate(): ReturnType {
  return useMutation(
      "update",
      ({user, token}: UpdateProps) => update(user, token),
  );
}
