import useParams from "./useParams";

export default function useIsAuthenticated(): boolean {
  const params = useParams();
  return !!params.user && !!params.token && !params.disable;
}
