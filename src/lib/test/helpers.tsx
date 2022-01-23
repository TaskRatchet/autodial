import React, {ReactElement} from "react";
import {render, RenderResult} from "@testing-library/react";
import {QueryClient, QueryClientProvider, setLogger} from "react-query";

import * as time from "../time";

export const setNow = (yyyy: number, m: number, d: number): number => {
  const value: number = Date.UTC(yyyy, m - 1, d, 12) / 1000;
  jest.spyOn(time, "now").mockReturnValue(value);
  return value;
};


export function r(ui: ReactElement): RenderResult {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 0,
      },
    },
  });
  return render(<QueryClientProvider client={queryClient}>
    {ui}</QueryClientProvider>);
}

export async function withMutedReactQueryLogger<T>(
    func: () => Promise<T>,
): Promise<T> {
  const noop = () => {
    // do nothing
  };

  setLogger({
    log: noop,
    warn: noop,
    error: noop,
  });

  const result = await func();

  setLogger(window.console);

  return result;
}
