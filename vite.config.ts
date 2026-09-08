/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // functions/src/test/helpers.ts (shared with the Worker's own jest
      // suite, out of scope to edit here) imports `expect` from
      // "@jest/globals" and registers the `toFuzzyEqual` matcher via
      // expect.extend(). Redirect that import to vitest's own `expect` so
      // the matcher lands on the same instance our specs use.
      "@jest/globals": "vitest",
    },
  },
  build: {
    // The Worker (functions/wrangler.toml [assets]) serves the SPA from
    // "../build" — keep CRA's output directory rather than touching that
    // config (functions/ is out of scope for this migration).
    outDir: "build",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setupTests.ts"],
    css: false,
    // functions/ has its own jest suite (run separately via `cd functions &&
    // npm test`); don't let vitest's default glob pick those specs up too.
    include: ["src/**/*.spec.{ts,tsx}"],
    // Mirrors the old root jest config's `resetMocks: true`: clear calls and
    // any mocked implementation between tests so state doesn't leak across
    // specs in the same file.
    mockReset: true,
  },
});
