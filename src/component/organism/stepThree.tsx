import {LoadingButton} from "@mui/lab";
import React from "react";
import useForce from "../../lib/useForce";
import useGoals from "../../lib/useGoals";

export default function StepThree(): JSX.Element {
  const goals = useGoals();
  const force = useForce({onSuccess: async () => {
    await goals.refetch();
  }});

  const forceMap: { label: string } = {
    "idle": {label: "Force Run"},
    "loading": {label: "Running..."},
    "error": {label: "Error"},
    "success": {label: "Success"},
  }[force.status];

  return <>
    <h3>Step 3: Use Beeminder as normal</h3>
    <p>
      Once a day at minimum, the autodialer will adjust the rates of your
      enabled goals to equal your average for the last 30 days.
    </p>

    <p>
      Or, if you don't feel like waiting, click this button to force the
      autodialer to run:
    </p>

    <LoadingButton variant={"outlined"} color={"secondary"}
      onClick={() => force.mutate({})}
      loading={force.isLoading}>{forceMap.label}</LoadingButton>
  </>;
}
