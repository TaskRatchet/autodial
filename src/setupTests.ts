// jest-dom adds custom vitest/jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import { vi } from "vitest";

// src/lib/test/helpers.tsx's setNow() calls `jest.spyOn(...)`, not
// `vi.spyOn(...)`, because that file is also imported directly by
// functions/src/doCron.spec.ts (the Worker's own jest suite, out of scope to
// edit — see PR #54/#55, which established that this shared helper's API has
// to stay usable from functions/'s jest build). Shim the global here so the
// same call works under vitest too; vi's spy API is a compatible subset of
// jest's for the .spyOn().mockReturnValue() pattern this file uses.
(globalThis as { jest?: unknown }).jest = vi;
