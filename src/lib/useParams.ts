import {getParams} from "./browser";

export default function useParams(): {
  user: string | null,
  token: string | null,
  disable: boolean
  } {
  const params = getParams();
  return {
    user: params.get("username"),
    token: params.get("access_token"),
    disable: params.get("disable") === "true",
  };
}
