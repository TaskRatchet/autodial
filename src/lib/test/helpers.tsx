import { render, RenderResult } from "npm:@testing-library/react";
import { QueryClient } from "npm:react-query@3.34.16/lib/core/queryClient.js";
import { QueryClientProvider } from "npm:react-query@3.34.16/lib/react/QueryClientProvider.js";
import { setLogger } from "npm:react-query@3.34.16/lib/core/logger.js";
import React from "npm:react";
import {
  stub,
  returnsArg,
} from "https://deno.land/std@0.165.0/testing/mock.ts";

import * as time from "../time.ts";

export const setNow = (yyyy: number, m: number, d: number): number => {
  const value: number = Date.UTC(yyyy, m - 1, d, 12) / 1000;
  // jest.spyOn(time, "now").mockReturnValue(value);
  stub(time, "now", returnsArg(value));
  return value;
};

export function r(ui: unknown): RenderResult {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 0,
      },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

export async function withMutedReactQueryLogger<T>(
  func: () => Promise<T>
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

  setLogger(self.console);

  return result;
}
