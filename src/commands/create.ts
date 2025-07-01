import { readFile } from "node:fs/promises";
import path, { join } from "node:path";
import process from "node:process";
import { type Manifest } from "@taskless/loader";
import { mkdirp } from "mkdirp";
import { create as c } from "tar";

export type CreateOptions = {
  manifest: string;
  wasm: string;
  out: string;
};

export const create = async (options: CreateOptions) => {
  // create a temp directory
  // resolve out, manifest, and wasm paths into absolute paths
  // copy the manifest and wasm files into the temp directory
  // create a tar file that includes the manifest and wasm files
  // then place that tar file into the out directory
  if (!options.manifest || !options.wasm || !options.out) {
    throw new Error("Manifest, wasm, and out options are required");
  }

  const manifestPath = join(process.cwd(), options.manifest);
  const wasmPath = join(process.cwd(), options.wasm);
  const outPath = (options.out ?? "").startsWith("/")
    ? options.out
    : join(process.cwd(), options.out);

  let packName = "";
  let packVersion = "";

  try {
    const manifestContent = await readFile(manifestPath, "utf8");
    const manifestJson = JSON.parse(manifestContent) as Manifest;
    packName = manifestJson.name;
    packVersion = manifestJson.version;
  } catch {
    console.error("Failed to read manifest file. Ensure it is a valid JSON.");
    process.exit(1); // eslint-disable-line unicorn/no-process-exit
  }

  await mkdirp(outPath);
  await c(
    {
      file: join(outPath, "pack.tgz"),
      gzip: true,
      portable: true,
    },
    [manifestPath, wasmPath]
  );

  console.log(
    `Pack ${packName}@${packVersion} pack.tgz created successfully in ${outPath}`
  );
};
