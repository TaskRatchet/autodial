import {useMutation, UseMutationResult} from "react-query";
import {remove} from "./functions";
import firebase from "firebase";
import HttpsCallableResult = firebase.functions.HttpsCallableResult;

type RemoveProps = { user: string, token: string };
type ReturnType = UseMutationResult<
  HttpsCallableResult, {message: string}, RemoveProps>;

export default function useRemove(): ReturnType {
  return useMutation(
      "remove",
      ({user, token}: RemoveProps) => remove(user, token),
  );
}
