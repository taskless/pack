import { readFile } from "node:fs/promises";
import process from "node:process";
import { taskless } from "@taskless/loader/core";
import { green, red } from "colorette";
import jp from "jsonpath";
import { http } from "msw";
import { setupServer } from "msw/node";
import { type JsonObject } from "type-fest";
import { z } from "zod";
import type { ConsolePayload, Manifest } from "@taskless/loader";

export const validateFixture = z.object({
  request: z.object({
    method: z.string(),
    url: z.string(),
    headers: z.array(z.tuple([z.string(), z.string()])),
    body: z.string().optional(),
  }),
  response: z.object({
    status: z.number(),
    statusText: z.string().optional(),
    headers: z.array(z.tuple([z.string(), z.string()])),
    body: z.string().optional(),
  }),
  tests: z
    .array(
      z.object({
        name: z.string(),
        test: z.string(),
      })
    )
    .optional(),
});
export type Fixture = z.infer<typeof validateFixture>;

export type PackcheckOptions = {
  format: string;
  fixture: string;
  manifest: string;
  wasm: string;
};

const loadManifest = async (path: string): Promise<Manifest> => {
  const contents = await readFile(path);
  const manifest = JSON.parse(contents.toString()) as Manifest;

  return manifest;
};

const loadWasm = async (path: string): Promise<Uint8Array> => {
  const contents = await readFile(path);
  return contents as Uint8Array;
};

const loadFixture = async (path: string): Promise<Fixture> => {
  const contents = await readFile(path);
  const fixture = validateFixture.parse(
    JSON.parse(contents.toString()) as JsonObject
  );

  return fixture;
};

export const check = async (options: PackcheckOptions) => {
  const wasmFile = await loadWasm(options.wasm);
  const manifestFile = await loadManifest(options.manifest);
  const fixtureFile = await loadFixture(options.fixture);

  const request = new Request(fixtureFile.request.url, {
    method: fixtureFile.request.method,
    headers: fixtureFile.request.headers,
    body: fixtureFile.request.body,
  });
  const response = new Response(fixtureFile.response.body, {
    status: fixtureFile.response.status,
    statusText: fixtureFile.response.statusText,
    headers: fixtureFile.response.headers,
  });

  const msw = setupServer(
    http.all("*", async (info) => {
      return response;
    })
  );
  msw.listen();

  const log = () => {
    /* noop */
  };

  const logs: ConsolePayload[] = [];
  const messages: Record<string, string[]> = {
    debug: [],
    info: [],
    warn: [],
    error: [],
  };

  const createLogger = (type: string) => (message: string) => {
    messages[type].push(message);
  };

  const t = taskless(undefined, {
    network: false,
    logging: true,
    flushInterval: 0,
    logLevel: "debug",
    __experimental: {
      // any MSW compatible API is fine for now
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      msw: msw as unknown as any,
    },
    log: {
      debug: createLogger("debug"),
      info: createLogger("info"),
      warn: createLogger("warn"),
      error: createLogger("error"),
      data(message) {
        logs.push(JSON.parse(message) as ConsolePayload);
      },
    },
  });

  t.add(manifestFile, wasmFile);

  await t.load();

  await fetch(request);

  await t.flush();

  msw.close();

  const tests: Array<{ name: string; pass: boolean }> = [];

  // perform tests if any
  if (fixtureFile.tests) {
    for (const test of fixtureFile.tests) {
      const result = jp.query(logs, test.test);
      tests.push({ name: test.name, pass: result.length > 0 });
    }
  }

  // a simplified set of things we test and output against
  const output = {
    logs,
    tests,
    messages,
  };

  // check tests for failure
  const failed = output.tests.some((t) => !t.pass);

  switch (options.format) {
    case "test": {
      for (const test of output.tests) {
        const color = test.pass ? green : red;
        const symbol = test.pass ? "✓" : "🗙";
        console.log(`${color(symbol)} ${color(test.name)}`);
      }

      break;
    }

    case "json": {
      console.log(JSON.stringify(output, null, 2));
      break;
    }

    case "ndjson": {
      for (const line of output.logs) {
        console.log(JSON.stringify(line));
      }

      for (const line of output.tests) {
        console.log(JSON.stringify(line));
      }

      break;
    }

    default: {
      throw new Error(`Invalid format: ${options.format}`);
    }
  }

  if (failed) {
    process.exit(1); // eslint-disable-line unicorn/no-process-exit
  }
};
