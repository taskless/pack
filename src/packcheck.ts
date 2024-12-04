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
  format: "json" | "ndjson" | "none";
  test: boolean;
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

  const t = taskless(undefined, {
    network: false,
    logging: true,
    flushInterval: 0,
    logLevel: "debug",
    __experimental: {
      msw,
    },
    log: {
      debug: log,
      info: log,
      warn: log,
      error: log,
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

  // perform tests if any
  if (options.test && options.fixture.tests) {
    for (const test of options.fixture.tests) {
      const result = jp.query(logs, test.test);
      if (result.length === 0) {
        throw new Error(`${red("🗙")} ${red(test.name)}`);
      } else {
        console.log(`${green("✓")} ${green(test.name)}`);
      }
    }
  }

  if (options.format === "none") {
    return "";
  }

  if (options.format === "json") {
    return JSON.stringify(logs, null, 2);
  }

  if (options.format === "ndjson") {
    const lines: string[] = [];
    for (const log of logs) {
      lines.push(JSON.stringify(log));
    }

    return lines.join("\n");
  }

  console.error("ERROR: Invalid format");
  return "";
};
