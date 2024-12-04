#!/usr/bin/env -S node --no-warnings

import { readFileSync } from "node:fs";
import process from "node:process";
import { type Manifest } from "@taskless/loader";
import commandLineArgs, { type OptionDefinition } from "command-line-args";
import commandLineUsage, { type Section } from "command-line-usage";
import { type JsonObject } from "type-fest";
import {
  packcheck,
  validateFixture,
  type PackcheckOptions,
} from "./packcheck.js";

// convert clu to cla args
const extractDefinitions = (list: Section[]): OptionDefinition[] => {
  const definitions: OptionDefinition[] = [];
  for (const section of list) {
    if ("optionList" in section) {
      definitions.push(...(section.optionList ?? []));
    }
  }

  return definitions;
};

const sections: Section[] = [
  {
    header: "packcheck",
    content:
      "Packcheck is a testing tool for testing your WebAssembly Packs with Taskless. Under the hood, it uses the Taskless API and the `mock service worker` library in order to simulate an API call. It will then output the logs in your requested format to stdout, making it easy to integrate packcheck into an existing test libarary. By using the CLI and a tool like execa() or spawn(), the stubbing functions of Taskless are isolated from your other tests.",
  },
  {
    header: "Options",
    optionList: [
      {
        name: "fixture",
        type: String,
        typeLabel: "<file>",
        description:
          "A fixture file that contains information about the simulated request a client might make and response an API might provide. This JSON fixture is used to set up the mock API request.",
      },
      {
        name: "manifest",
        type: String,
        typeLabel: "<file>",
        description:
          "Your manifest file is the file you'll be uploading to Taskless which includes your permissions, metadata, and captures",
      },
      {
        name: "format",
        type: String,
        typeLabel: "<format>",
        defaultValue: "none",
        description:
          "The output format to use. Setting the output will disable automatic testing (--test). Must be one of:\njson, ndjson, none",
      },
      {
        name: "test",
        type: Boolean,
        description:
          "Run tests on the output. This will output the test results to stdout. Enabled by default, but disabled if an output other than 'none' is set",
      },
      {
        name: "wasm",
        type: String,
        typeLabel: "<file>",
        defaultOption: true,
        description: "The WebAssembly file you want to test",
      },
      {
        name: "help",
        alias: "h",
        type: Boolean,
        description: "Print this message",
      },
    ],
  },
];

const required = ["fixture", "manifest", "wasm"];
const formats = ["json", "ndjson", "none"];

const options = commandLineArgs(extractDefinitions(sections));

if (
  options.help ||
  !required.every((key) => options[key]) ||
  !formats.includes(options.format as string)
) {
  console.log(commandLineUsage(sections));
  process.exit(0);
}

try {
  // read our JSON files using readfileSync
  const fixture = validateFixture.parse(
    JSON.parse(readFileSync(options.fixture as string).toString()) as JsonObject
  );
  const manifest = JSON.parse(
    readFileSync(options.manifest as string).toString()
  ) as Manifest;
  const wasm = readFileSync(options.wasm as string);

  // packcheck logic
  try {
    // run packcheck with our options & perform tests
    const output = await packcheck({
      format: options.format as PackcheckOptions["format"],
      test: options.format === "none" || (options.test as boolean),
      fixture,
      manifest,
      wasm,
    });

    // return lines to stdout
    if (options.format !== "none") {
      console.log(output);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error running packcheck", error);
    process.exit(1);
  }
} catch (error) {
  console.error("Error reading files", error);
  process.exit(1);
}
