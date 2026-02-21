# `cli/src/index.ts`

> **Role**: Entry point and command definition for the `lingo` CLI. Handles argument parsing, configuration updates, command execution, and error explanation.

**Source**: [`cli/src/index.ts`](../../packages/cli/src/index.ts)  
**Shebang**: `#!/usr/bin/env node` — makes this directly executable as a CLI binary.

---

## Overview

`index.ts` is the bootstrap file for the entire Linguastik CLI. It defines all commands and flags using the `commander` library, wires up the configuration system, and orchestrates command execution with real-time translation.

---

## Dependencies

| Import                | Source               | Purpose                                                            |
| --------------------- | -------------------- | ------------------------------------------------------------------ |
| `Command`             | `commander`          | CLI argument/option parsing                                        |
| `createRequire`       | `module`             | Node.js ESM-compatible `require()` shim for reading `package.json` |
| `configManager`       | `@linguastik/shared` | Reading and writing user settings                                  |
| `explainer`           | `@linguastik/shared` | Error pattern matching and analysis                                |
| `execWithTranslation` | `./wrapper.js`       | Spawning the target command with translated output                 |
| `format`              | `./formatter.js`     | Styled console output                                              |

---

## CLI Definition

```
lingo [options] [command...]
```

The program is registered with `commander` using:

```typescript
const program = new Command();
program
  .name("lingo")
  .description(
    "Wraps terminal commands and translates their output in real-time"
  )
  .version(pkg.version);
```

---

## Options

| Flag            | Short | Type      | Description                                                                 |
| --------------- | ----- | --------- | --------------------------------------------------------------------------- |
| `--lang <lang>` | `-l`  | `string`  | Set target translation language (e.g., `es`, `ja`, `fr`)                    |
| `--key <key>`   | `-k`  | `string`  | Set the Lingo.dev API key and save it to config                             |
| `--explain`     | —     | `boolean` | When the command fails, analyze the error and show a structured explanation |

### Argument

| Name           | Description                                                              |
| -------------- | ------------------------------------------------------------------------ |
| `[command...]` | The terminal command (and its arguments) to run and translate. Optional. |

---

## Execution Logic

### 1. Option Processing

```typescript
if (options.key) {
  configManager.set("apiKey", options.key);
  console.log(format.success("API key updated successfully."));
}
if (options.lang) {
  configManager.set("targetLang", options.lang);
}
```

If only options are provided (no command), the CLI prints success/info messages and exits. If no options and no command: the help message is shown.

---

### 2. API Key Validation

Before executing, the CLI checks for a valid API key:

```typescript
if (!configManager.getApiKey()) {
  console.log(
    format.warn("Warning: No API key found. Translation will be disabled.")
  );
  console.log(format.info("Run `lingo --key <your-api-key>` to set it."));
}
```

Translation is disabled but execution proceeds — the user still gets the raw output.

---

### 3. Command Execution with `--explain`

When `--explain` is set, the CLI **monkey-patches** `process.stderr.write` to capture error output before it's printed:

```typescript
const originalStderrWrite = process.stderr.write;
process.stderr.write = function (chunk, encoding, cb) {
  capturedStderr += chunk.toString();
  return originalStderrWrite.call(process.stderr, chunk, encoding, cb);
};
```

This ensures that the user still sees stderr in real-time while Linguastik also records it for analysis.

---

### 4. Error Explanation Rendering

After the command fails, the captured stderr is passed to `explainer.explain()`. If a match is found, a formatted box is rendered:

```typescript
const explanation = await explainer.explain(capturedStderr);
if (explanation) {
  const content = `
${format.dim(`Tool: ${explanation.tool}`)}
${format.error(`Problem: ${explanation.problem}`)}
${explanation.causes.map((c) => `  - ${c}`).join("\n")}
${explanation.fixes.map((f) => `  - ${f}`).join("\n")}
${format.dim(`Learn more: ${explanation.learnMoreUrl}`)}
  `.trim();

  console.log(
    format.box(
      `[${explanation.severity.toUpperCase()}] ${explanation.title}`,
      content,
      severityColor
    )
  );
}
```

---

### 5. Exit Code Propagation

The CLI propagates the child process's exit code using `process.exitCode` and `process.exit()`, ensuring that shell scripts and CI systems correctly detect failures.

---

## Example Usage

```bash
# Set API key
lingo --key lingo_live_abc123

# Set target language
lingo --lang ja

# Translate output of a command
lingo npm install

# Translate + explain on failure
lingo --explain git push origin main
```

---

## Related Modules

- [`cli/wrapper.ts`](./wrapper.md) — executes the wrapped command
- [`cli/formatter.ts`](./formatter.md) — provides `format.*` utilities
- [`shared/config.ts`](../shared/config.md) — persists settings
- [`shared/explainer.ts`](../shared/explainer.md) — analyzes errors
