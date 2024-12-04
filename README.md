# @taskless/packcheck

Validate your Taskless Packs before submitting

# Usage

```bash
npx @taskless/packcheck --fixture <fixture> --manifest <manifest> [--format none|json|ndjson] <wasm>
```

| flag         | type              | description                              |
| :----------- | :---------------- | :--------------------------------------- |
| `--fixture`  | string            | Path to the fixture JSON file            |
| `--manifest` | string            | Path to the manifest JSON file           |
| `--format`   | (optional) string | Output format (none, test, json, ndjson) |
| `<wasm>`     | string            | Path to the wasm file                    |

# Fixture Format

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

# Controlling Output

The `--format` flag allows you to control the output format. The default format is `test`, which will only output the result of the tests. The `json` format will output the result of the tests as a single JSON array. The `ndjson` format will output the output as newline-delimited JSON. These output formats mimic what you would get using the Taskless library in programatic mode, combined with the test results.
