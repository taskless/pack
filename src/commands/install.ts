import { createWriteStream } from "node:fs";
import { readFile, writeFile, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { pipeline as streamPipeline } from "node:stream/promises";
import { copyFile } from "copy-file";
import dotenv from "dotenv";
import got from "got";
import { mkdirp } from "mkdirp";
import semverRegex from "semver-regex";
import { extract } from "tar";

type InstallOptions = {
  url: string; // url or identifier
  destination?: string; // destination directory
  env?: string; // path to environment file
};

type ExpectedEnvironmentKeys = {
  TASKLESS_API_KEY?: string;
};

const loadEnvironment = async (
  path: string
): Promise<Record<string, string>> => {
  const contents = await readFile(path);
  const env = dotenv.parse<ExpectedEnvironmentKeys>(contents);
  return env;
};

const cleanPackName = (value: string) => {
  const segments = value.split("/");
  if (segments.length > 2 || segments.length === 0) {
    throw new Error(
      `Invalid pack name: ${value}. Expected format: @scope/pack-name or pack-name.`
    );
  }

  // @taskless/pack-name => ["@taskless", "pack-name"]
  // pack-name => [undefined, "pack-name"]
  const name = segments.pop();
  const scope = segments.pop();

  if (!name || !/^[a-z][\w.-]*[a-z\d]$/i.test(name)) {
    throw new Error(
      `Invalid pack name: ${value}. Expected format: @scope/pack-name or pack-name.`
    );
  }

  if (scope && !/^@[a-z][\w-]*[a-z\d]$/i.test(scope)) {
    throw new Error(`Invalid pack scope: ${scope}. Expected format: @scope`);
  }

  return { scope, name };
};

export const install = async (options: InstallOptions) => {
  // TODO: When Taskless can install by identifier, we will need the API key and host info
  // const env = options.env ? await loadEnvironment(options.env) : {};
  // const apiKey = env.TASKLESS_API_KEY ?? process.env.TASKLESS_API_KEY;
  // const host =
  //   env.TASKLESS_API_ENDPOINT ??
  //   // eslint-disable-next-line n/no-process-env
  //   process.env.TASKLESS_API_ENDPOINT ??
  //   "https://api.taskless.io/graphql";

  /** Saves a files either via URL or file path */
  const saveFile = async (url: string, destination: string) => {
    // file copy, avoid streaming via got
    // TODO: try/catch broken file
    if (url.startsWith("file://")) {
      const localPath = url.replace(/^file:\/\//, "");
      await copyFile(localPath, destination);
      return;
    }

    // got stream
    // TODO: try/catch bad URL
    await streamPipeline(got.stream(url), createWriteStream(destination));
  };

  const downloadDirectory = await mkdtemp(join(tmpdir(), `tskl-`));
  const filePath = join(downloadDirectory, `pack-${Date.now()}.tgz`);

  await saveFile(options.url, filePath);
  await extract({
    file: filePath,
    cwd: downloadDirectory,
  });

  // read the manifest.json file from the extracted directory
  const manifestPath = join(downloadDirectory, "manifest.json");
  const manifestContent = await readFile(manifestPath, "utf8");
  const manifest = JSON.parse(manifestContent) as Record<
    string,
    unknown | undefined
  >;
  const packName = manifest?.name as string | undefined;
  const packVersion = manifest?.version as string | undefined;

  if (
    !packName ||
    !packVersion ||
    typeof packName !== "string" ||
    typeof packVersion !== "string"
  ) {
    throw new Error(
      `Invalid manifest.json in pack: ${manifestPath}. Expected "name" and "version" fields.`
    );
  }

  // clean version of pack information
  const scopeAndName = cleanPackName(packName);
  const cleanPackVersion =
    semverRegex().exec(packVersion.slice(0, 100))?.[0] ?? "0.0.0";

  // create the destination directory for this pack
  const cwd = process.cwd();
  const destination = options.destination ?? join(cwd, ".taskless");
  const cleanedPackDirectory = join(
    destination,
    ...[scopeAndName.scope, `${scopeAndName.name}@${cleanPackVersion}`].filter(
      (v) => v !== undefined
    )
  );

  // create the pack directory
  await mkdirp(cleanedPackDirectory);

  // create the user configuration directory
  const userConfiguration = {
    url: {
      source: "file://./pack.wasm",
      signature: "",
    },
    configuration: {},
  };
  const packConfigurationPath = join(cleanedPackDirectory, "config.json");
  await writeFile(
    packConfigurationPath,
    JSON.stringify(userConfiguration, null, 2)
  );

  // copy the wasm file and manifest to the pack directory
  const packWasmPath = join(cleanedPackDirectory, "pack.wasm");
  const packManifestPath = join(cleanedPackDirectory, "manifest.json");
  await copyFile(join(downloadDirectory, "pack.wasm"), packWasmPath);
  await copyFile(manifestPath, packManifestPath);

  console.log(`Installed pack ${packName}@${packVersion}`);
};
