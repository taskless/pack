import process from "node:process";
import { Command } from "@commander-js/extra-typings";
import { readPackageUpSync } from "read-package-up";
import { install } from "./commands/install.js";
import { packcheck } from "./commands/packcheck.js";
import { publish } from "./commands/publish.js";

const packageData = readPackageUpSync();
const packageJson = packageData?.packageJson;

if (!packageJson) {
  console.error(
    "Could not find package.json in the current directory or any parent directory."
  );
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
}

const program = new Command();

program
  .name("pack")
  .description("Work with Taskless packs")
  .version(packageJson.version ?? "unknown");

program
  .command("check")
  .description("Check a pack against fixtures")
  // .argument('<string>', 'string to split')
  .requiredOption("--fixture <fixture>", "Path to the fixture file")
  .requiredOption("--manifest <manifest>", "Path to the manifest file")
  .requiredOption("--wasm <wasm>", "Path to the wasm file")
  .requiredOption(
    "--format <format>",
    "Output format. One of json, ndjson, none, test",
    (value) => {
      const validFormats = ["json", "ndjson", "none", "test"];
      if (validFormats.includes(value)) {
        return value;
      }

      throw new Error(
        `Invalid format: ${value}. Valid formats are: ${validFormats.join(", ")}`
      );
    }
  )
  .action(async (options) => {
    await packcheck({
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

program.parse(process.argv);
