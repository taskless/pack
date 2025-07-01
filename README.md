# @taskless/pack

Utilities for working with Taskless Packs - [taskless.io](https://www.taskless.io)

# Usage

```
npx @taskless/pack <command>
```

- **install** Install a pack from a URL, downloading the pack.tgz and extracting it to the current directory
- **check** Check a pack against fixtures, running a test suite that simulates network requests and responses
- **publish** Publish a pack to Taskless Cloud (must be an organization with `publish` permission)
- **create** Create a pack.tgz from a manifest and wasm file for distribution outside of Taskless

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
