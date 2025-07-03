# @taskless/packcheck

## 0.0.20

### Patch Changes

- Fixes tar extraction to remove path stripping

## 0.0.19

### Patch Changes

- fbe1346: [bundle] - Full paths are no longer included in the bundled tgz

## 0.0.18

### Patch Changes

- Makes format for pack check optional, defaulting to test output

## 0.0.17

### Patch Changes

- Fixes an issue where the CLI would refer to a compiled file that no longer existed

## 0.0.16

### Patch Changes

- Updates versioning info and removes unneeded dependencies

## 0.0.15

### Patch Changes

- Updates create command to bundle

## 0.0.14

### Patch Changes

- ebeb59f: Adds the pack creation subcommand

## 0.0.11

### Patch Changes

- adds an install command

## 0.0.10

### Patch Changes

- a313fc5: Updates the dependencies to use the latest loader code

## 0.0.9

### Patch Changes

- ca436d8: Moves taskless/loader to \* for semver, so that pack checking is always based on the latest build

## 0.0.8

### Patch Changes

- caa45f4: Updates the CLI command for the published package

## 0.0.6

### Patch Changes

- fa9a1f1: Renames to @taskless/pack to support check and publish operations

## 0.0.5

### Patch Changes

- 523e4be: Updates Taskless Loader to pre2 schemas
- 956014a: Fixes tests to use namespaced pack names
- Updates dependencies for taskless loader

## 0.0.4

### Patch Changes

- b99a7e4: Messages from Taskless are now available in the JSON outputs

## 0.0.3

### Patch Changes

- 513c3e1: Updates CLI to simplify formatting

## 0.0.2

### Patch Changes

- 344283d: Initial packcheck port from @taskless/loader
