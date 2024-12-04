/* eslint-disable n/no-process-env */
import { dirname, resolve } from "node:path";
import process, { exit } from "node:process";
import { fileURLToPath } from "node:url";
import { execa } from "execa";
import { test, describe, beforeAll } from "vitest";

describe("CLI (requires build, bypass with NO_BUILD=1)", () => {
  beforeAll(async () => {
    if (process.env.NO_BUILD === "1") {
      return;
    }

    await execa({
      preferLocal: true,
      cwd: resolve(dirname(fileURLToPath(import.meta.url)), "../"),
    })`pnpm build`;
  });

  test("Runs default fixture", async ({ expect }) => {
    const { stdout, stderr, exitCode } = await execa({
      preferLocal: true,
      cwd: resolve(dirname(fileURLToPath(import.meta.url)), "../"),
    })`./dist/index.js --fixture ./test/fixtures/fixture.json --manifest ./test/fixtures/manifest.json ./test/fixtures/sample.wasm`;

    if (exitCode !== 0) {
      console.error(stdout);
      console.error(stderr);
      expect(exitCode).toBe(0);
    }

    expect(exitCode).toBe(0);
  });
});
