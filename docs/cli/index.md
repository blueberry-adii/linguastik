# `cli/src/index.ts`

> **Role**: Entry point and command definition for the `lingo` CLI. Handles argument parsing, configuration updates, and command execution with real-time or precise translation.

**Source**: [`cli/src/index.ts`](../../packages/cli/src/index.ts)  
**Shebang**: `#!/usr/bin/env node` — makes this directly executable as a CLI binary.

---

## Overview

`index.ts` is the bootstrap file for the Linguastik CLI. It defines all commands and flags using `commander`, wires up the configuration system, and orchestrates two execution modes: streaming line-by-line translation and precise full-output translation.

---

## Dependencies

| Import                | Source               | Purpose                                                            |
| --------------------- | -------------------- | ------------------------------------------------------------------ |
| `Command`             | `commander`          | CLI argument/option parsing                                        |
| `createRequire`       | `module`             | Node.js ESM-compatible `require()` shim for reading `package.json` |
| `configManager`       | `@linguastik/shared` | Reading and writing user settings                                  |
| `translator`          | `@linguastik/shared` | Translation and full-output summarization                          |
| `execWithTranslation` | `./wrapper.js`       | Spawns the target command with streaming line-by-line translation  |
| `execAndCapture`      | `./wrapper.js`       | Spawns the target command with raw passthrough and captures output |
| `format`              | `./formatter.js`     | Styled console output                                              |

---

## CLI Definition

```
lingo [options] [command...]
```

---

## Options

| Flag            | Short | Type      | Description                                                                               |
| --------------- | ----- | --------- | ----------------------------------------------------------------------------------------- |
| `--lang <lang>` | `-l`  | `string`  | Set target translation language (e.g., `es`, `ja`, `fr`)                                  |
| `--key <key>`   | `-k`  | `string`  | Set the Lingo.dev API key and save it to config                                           |
| `--precise`     | `-p`  | `boolean` | Run command with raw passthrough, then send the full output to lingo.dev for an accurate, context-aware translation shown in a summary box |

### Argument

| Name           | Description                                                              |
| -------------- | ------------------------------------------------------------------------ |
| `[command...]` | The terminal command (and its arguments) to run and translate. Optional. |

---

## Execution Modes

### Default — Streaming Translation

```bash
lingo npm install
```

Each line of stdout/stderr is translated individually in parallel (up to 5 concurrent requests via `pLimit`), then printed in original order using an ordered output queue.

### Precise Mode (`-p` / `--precise`)

```bash
lingo -p npm help
```

1. The command runs with **raw passthrough** — output prints as-is, no per-line translation. Command names, flags, and file paths are preserved.
2. After the command finishes, the **full captured output** is sent to lingo.dev in a single request via `translator.summarize()`.
3. lingo.dev returns a concise, context-aware translation/summary, displayed in a styled `✦ Linguastik` box.

Uses a **separate disk cache** from default mode (`~/.lingo-dev/cache/translations/precise/` vs `default/`).

---

## Example Usage

```bash
# Set API key
lingo --key lingo_live_abc123

# Set target language
lingo --lang ja

# Translate output of a command (streaming)
lingo npm install

# Precise mode — full-context translation summary
lingo -p npm help
lingo --precise git log --oneline
```

---

## Related Modules

- [`cli/wrapper.ts`](./wrapper.md) — executes the wrapped command
- [`cli/formatter.ts`](./formatter.md) — provides `format.*` utilities
- [`shared/config.ts`](../shared/config.md) — persists settings
- [`shared/translator.ts`](../shared/translator.md) — translation and summarization
