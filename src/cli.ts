import process from "node:process";
import { Command } from "@commander-js/extra-typings";
import pk from "../package.json" with { type: "json" };
import { bundle } from "./commands/bundle.js";
import { check } from "./commands/check.js";
import { install } from "./commands/install.js";
import { publish } from "./commands/publish.js";

const program = new Command();

program
  .name("pack")
  .description("Work with Taskless packs")
  .version(pk.version ?? "unknown");

program
  .command("check")
  .description("Check a pack against fixtures")
  // .argument('<string>', 'string to split')
  .requiredOption("--fixture <fixture>", "Path to the fixture file")
  .requiredOption("--manifest <manifest>", "Path to the manifest file")
  .requiredOption("--wasm <wasm>", "Path to the wasm file")
  .option(
    "--format <format>",
    "Output format. One of json, ndjson, none, test. Defaults to test",
    (value) => {
      const validFormats = ["json", "ndjson", "none", "test", "", undefined];
      if (validFormats.includes(value)) {
        if (value === "" || value === undefined) {
          return "test"; // Default to json if empty
        }

        return value;
      }

      throw new Error(
        `Invalid format: ${value}. Valid formats are: ${validFormats.join(", ")}`
      );
    }
  )
  .action(async (options) => {
    await check({
      format: options.format,
      fixture: options.fixture,
      manifest: options.manifest,
      wasm: options.wasm,
    });
  });

program
  .command("publish")
  .description("Publish a pack")
  // .argument('<string>', 'string to split')
  .requiredOption("--manifest <manifest>", "Path to the manifest file")
  .requiredOption("--wasm <wasm>", "Path to the wasm file")
  .option("--env [env]", "Path to the environment file")
  .action(async (options) => {
    const env = options.env && options.env !== true ? options.env : undefined;

    await publish({
      manifest: options.manifest,
      wasm: options.wasm,
      env,
    });
  });

program
  .command("install")
  .description("Install a pack by URL")
  .argument("<url>", "URL of a pack's tgz to install")
  .option(
    "-d, --destination <destination>",
    "Destination directory for the installed pack, defaults to ./.taskless"
  )
  .option("--env [env]", "Path to the environment file")
  .action(async (url, options) => {
    await install({
      url,
      destination: options.destination,
      env: options.env && options.env !== true ? options.env : undefined,
    });
  });

program
  .command("version")
  .description("Show the version of the pack CLI")
  .action(() => {
    if (pk?.version) {
      console.log(`Pack CLI version: ${pk.version}`);
    } else {
      console.log("Pack CLI version: unknown");
    }
  });

program
  .command("bundle")
  .description(
    "Create a pack.tgz from a manifest and wasm file for distribution outside of Taskless"
  )
  .requiredOption("--manifest <manifest>", "Path to the manifest file")
  .requiredOption("--wasm <wasm>", "Path to the wasm file")
  .option(
    "--out <out>",
    "Output directory for the created pack, defaults to process.cwd()"
  )
  .action(async (options) => {
    await bundle({
      manifest: options.manifest,
      wasm: options.wasm,
      out: options.out ?? process.cwd(),
    });
  });

program.parse(process.argv);
