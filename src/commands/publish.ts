import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import http from "node:http";
import https from "node:https";
import process from "node:process";
import { $$, mutation, query } from "@~/__generated__/api.js";
import dotenv from "dotenv";
import { GraphQLClient } from "graphql-request";

const checkCredentials = query("CheckCredentials", (q) => [
  q.credentials((c) => [c.role, c.organization((o) => [o.id])]),
]);

const uploadRequest = mutation("UploadPackRequest", (m) => [
  m.uploadPack(
    {
      manifestSize: $$("manifestSize"),
      packSize: $$("packSize"),
    },
    (up) => [up.ticket, up.packUrl, up.manifestUrl]
  ),
]);

const uploadRequestConfirm = mutation("UploadPackRequestConfirm", (m) => [
  m.uploadPackConfirm({
    ticket: $$("ticket"),
  }),
]);

type PublishOptions = {
  manifest: string;
  wasm: string;
  env?: string;
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

/**
 * A put command that reads from disk with streams and avoids loading
 * the entire file into memory, because the file can be a large wasm file...
 */
const put = async (url: string, path: string) => {
  const httpModule = url.startsWith("https") ? https : http;
  const fileStat = await stat(path);
  const fileStream = createReadStream(path, {
    highWaterMark: 1024 * 1024, // 1MB chunks
  });

  // console.log(`Uploading ${path} to ${url}`);

  return new Promise((resolve, reject) => {
    const request = httpModule.request(
      url,
      { method: "PUT", headers: { "Content-Length": fileStat.size } },
      (respose) => {
        let responseBody = "";
        respose.on("data", (chunk: string) => {
          responseBody += chunk;
        });
        respose.on("end", () => {
          if (respose.statusCode === 200) {
            resolve(responseBody);
          } else {
            // console.error(responseBody);
            reject(
              new Error(
                `Failed to upload file: ${respose.statusCode} ${respose.statusMessage}`
              )
            );
          }
        });
      }
    );
    request.on("error", (error) => {
      reject(error);
    });

    fileStream.pipe(request);
  });
};

export const publish = async (options: PublishOptions) => {
  const env = options.env ? await loadEnvironment(options.env) : {};
  // eslint-disable-next-line n/no-process-env
  const apiKey = env.TASKLESS_API_KEY ?? process.env.TASKLESS_API_KEY;
  const host =
    env.TASKLESS_API_ENDPOINT ??
    // eslint-disable-next-line n/no-process-env
    process.env.TASKLESS_API_ENDPOINT ??
    "https://api.taskless.io/graphql";

  if (!apiKey) {
    throw new Error(
      "TASKLESS_API_KEY is not set. Please set it in your environment variables."
    );
  }

  const client = new GraphQLClient(host, {
    headers: {
      authorization: `apikey ${apiKey}`,
    },
  });

  // check your credentials
  const credentialsResponse = await client.request(checkCredentials);

  if (credentialsResponse.credentials?.role !== "organization") {
    console.error("You must be logged in as an organization to publish a pack");
    process.exit(1); // eslint-disable-line unicorn/no-process-exit
  }

  console.log(
    `Organization ID: ${credentialsResponse.credentials.organization?.id}`
  );

  // get the size of the manifest and wasm files
  const manifestStat = await stat(options.manifest);
  const wasmStat = await stat(options.wasm);

  try {
    // make a graphql request to the taskless api
    const uploadRequestResponse = await client.request(uploadRequest, {
      manifestSize: manifestStat.size,
      packSize: wasmStat.size,
    });

    // attempt to put the manifest (put operation of file contents)
    await put(uploadRequestResponse.uploadPack.manifestUrl, options.manifest);

    // attempt to put the wasm (put operation of file contents)
    await put(uploadRequestResponse.uploadPack.packUrl, options.wasm);

    // confirm the upload
    const uploadPackConfirmResponse = await client.request(
      uploadRequestConfirm,
      {
        ticket: uploadRequestResponse.uploadPack.ticket,
      }
    );

    if (uploadPackConfirmResponse.uploadPackConfirm) {
      console.log("Pack published successfully!");
    } else {
      throw new Error("Did not receive a confirmation from the server");
    }
  } catch (error) {
    console.error("Failed to publish pack");
    if (error instanceof Error) {
      console.error(error.message.split(":")[0]);
    }

    process.exit(1); // eslint-disable-line unicorn/no-process-exit
  }
};
