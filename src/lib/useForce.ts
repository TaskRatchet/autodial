import {useMutation, UseMutationResult, UseMutationOptions} from "react-query";
import force from "./force";

type Options = Omit<
  UseMutationOptions<Response, unknown, unknown>,
  "mutationKey" | "mutationFn"
  >

export default function useForce(
    options?: Options,
): UseMutationResult<Response> {
  return useMutation("force", force, options);
}
