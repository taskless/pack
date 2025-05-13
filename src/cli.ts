#!/usr/bin/env -S node --no-warnings

import process from "node:process";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { packcheck } from "./commands/packcheck.js";
import { publish } from "./commands/publish.js";

yargs()
  .command(
    "check",
    "Check a pack against fixtures",
    (yargs) => {
      return yargs.option({
        fixture: {
          type: "string",
          description: "Path to the fixture file",
          demandOption: true,
        },
        manifest: {
          type: "string",
          description: "Path to the manifest file",
          demandOption: true,
        },
        wasm: {
          type: "string",
          description: "Path to the wasm file",
          demandOption: true,
        },
        format: {
          type: "string",
          description: "Output format",
          choices: ["json", "ndjson", "none", "test"] as const,
          default: "test",
        },
      });
    },
    async (argv) => {
      // argv is fully typed
      await packcheck({
        format: argv.format,
        fixture: argv.fixture,
        manifest: argv.manifest,
        wasm: argv.wasm,
      });

      process.exit(0);
    }
  )
  .command(
    "publish",
    "Publish a pack",
    (yargs) => {
      return yargs.option({
        manifest: {
          type: "string",
          description: "Path to the manifest file",
          demandOption: true,
        },
        wasm: {
          type: "string",
          description: "Path to the wasm file",
          demandOption: true,
        },
        env: {
          type: "string",
          description: "Path to environment variables file",
          demandOption: false,
        },
      });
    },
    async (argv) => {
      // argv is fully typed
      await publish({
        manifest: argv.manifest,
        wasm: argv.wasm,
        env: argv.env,
      });

      process.exit(0);
    }
  )
  .demandCommand(1, "You need to specify a command")
  .help()
  .parse(hideBin(process.argv));
