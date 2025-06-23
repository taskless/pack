# @taskless/pack

Utilities for working with Taskless Packs - [taskless.io](https://www.taskless.io)

# Usage

```
npx @taskless/pack <command>

Commands:
  check    Check a pack against fixtures
  publish  Publish a pack
  install  Install a pack from a URL

--------------------------------------------------

pack check

Check a pack against fixtures

Options:
  --fixture   Path to the fixture file                       [string] [required]
  --manifest  Path to the manifest file                      [string] [required]
  --wasm      Path to the wasm file                          [string] [required]
  --format    Output format
          [string] [choices: "json", "ndjson", "none", "test"] [default: "test"]

--------------------------------------------------

pack publish

Publish a pack

Options:
  --manifest  Path to the manifest file                      [string] [required]
  --wasm      Path to the wasm file                          [string] [required]
  --env       Path to environment variables file                        [string]
```

# Testing Packs with `pack check`

## Fixture Format

A fixture file defines the mocked request, response, and tests you want to make against the logged Taskless data. The below example shows a simple fixture file with a single test that checks if the response status was 200.

```json
{
  "request": {
    "url": "https://example.com/api",
    "method": "POST",
    "headers": [["Content-Type", "application/json"]],
    "body": "{\"a\":1,\"b\":2}"
  },
  "response": {
    "status": 200,
    "statusText": "OK",
    "headers": [["Content-Type", "application/json"]],
    "body": "{\"c\":3,\"d\":4}"
  },
  "tests": [
    {
      "name": "response status was 200",
      "test": "$[*].dimensions[?(@.name == 'status' && @.value == 200)]"
    }
  ]
}
```

## Controlling Output

The `--format` flag allows you to control the output format. The default format is `test`, which will only output the result of the tests. The `json` format will output the result of the tests as a single JSON array. The `ndjson` format will output the output as newline-delimited JSON. These output formats mimic what you would get using the Taskless library in programatic mode, combined with the test results.

# Publishing Packs with `pack publish`

_To publish a pack, you need to have a Taskless organization with the `publishPack` permission. If you need to create custom packs, please reach out to us at hello[at]taskless._
