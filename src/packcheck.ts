import { taskless } from "@taskless/loader/core";
import { green, red } from "colorette";
import jp from "jsonpath";
import { http } from "msw";
import { setupServer } from "msw/node";
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
  format: "json" | "ndjson" | "none" | "test";
  fixture: Fixture;
  manifest: Manifest;
  wasm: ArrayBuffer;
};

export const packcheck = async (options: PackcheckOptions) => {
  const request = new Request(options.fixture.request.url, {
    method: options.fixture.request.method,
    headers: options.fixture.request.headers,
    body: options.fixture.request.body,
  });
  const response = new Response(options.fixture.response.body, {
    status: options.fixture.response.status,
    statusText: options.fixture.response.statusText,
    headers: options.fixture.response.headers,
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
      msw,
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

  t.add(options.manifest, options.wasm);

  await t.load();

  await fetch(request);

  await t.flush();

  msw.close();

  const tests: Array<{ name: string; pass: boolean }> = [];

  // perform tests if any
  if (options.fixture.tests) {
    for (const test of options.fixture.tests) {
      const result = jp.query(logs, test.test);
      tests.push({ name: test.name, pass: result.length > 0 });
    }
  }

  return {
    logs,
    tests,
    messages,
  };
};
