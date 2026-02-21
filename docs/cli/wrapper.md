# `cli/src/wrapper.ts`

> **Role**: Spawns the target terminal command as a child process and intercepts its output streams for real-time, line-by-line translation.

**Source**: [`cli/src/wrapper.ts`](../../packages/cli/src/wrapper.ts)  
**Called by**: [`cli/src/index.ts`](./index.md)

---

## Overview

`wrapper.ts` is the execution core of the Linguastik CLI. When a user runs `lingo <command>`, this module:

1. Spawns `<command>` as a child process.
2. Attaches to its `stdout` and `stderr` streams.
3. Buffers output and emits complete lines for translation.
4. Prints translated (or original) lines back to the terminal.

The design is intentionally streaming — it does not wait for the command to complete before beginning translation.

---

## Function: `execWithTranslation(command, args): Promise<void>`

| Parameter | Type       | Description                                                           |
| --------- | ---------- | --------------------------------------------------------------------- |
| `command` | `string`   | The executable name (e.g., `'git'`, `'npm'`, `'docker'`)              |
| `args`    | `string[]` | Arguments to pass to the command (e.g., `['push', 'origin', 'main']`) |

**Returns**: A `Promise<void>` that resolves when the child process exits and all translations are flushed.

---

## Internal Architecture

### Process Spawning

```typescript
const child = spawn(command, args, {
  stdio: ["inherit", "pipe", "pipe"],
  shell: false,
});
```

| `stdio` slot | Value       | Meaning                                         |
| ------------ | ----------- | ----------------------------------------------- |
| `stdin`      | `'inherit'` | Child receives input directly from the terminal |
| `stdout`     | `'pipe'`    | Captured by the wrapper for translation         |
| `stderr`     | `'pipe'`    | Captured by the wrapper for translation         |

> `shell: false` is used for security and cross-platform compatibility — commands are not passed through the system shell, preventing injection issues.

---

### Line Buffering

The child's output arrives in chunks (not necessarily line-by-line). A buffer accumulates data until a `\n` is found:

```typescript
child.stdout.on("data", (data) => {
  stdoutBuffer += data.toString();
  if (stdoutBuffer.includes("\n")) {
    const lines = stdoutBuffer.split("\n");
    stdoutBuffer = lines.pop() || ""; // keep incomplete last line
    for (const line of lines) {
      queueLine(line, false);
    }
  }
});
```

The same pattern applies to `stderr`. Any leftover buffer content is flushed when the `'close'` event fires.

---

### Concurrency-Limited Translation

```typescript
const limit = pLimit(5); // max 5 concurrent API calls

const processLine = async (line: string, isStderr: boolean) => {
  const translated = await limit(() => translator.translate(line));
  const output = translated && translated.trim().length > 0 ? translated : line;
  // print to stdout or stderr
};
```

Each line becomes a `Promise` tracked in `pendingTranslations[]`. Using `pLimit(5)` prevents API rate-limit errors and keeps the terminal responsive.

---

### Spinner Management

An `ora` spinner is displayed to indicate that translation is in progress. Because printing to `stdout` and running a spinner simultaneously causes visual artifacts (overwritten lines), the spinner is briefly paused for each print:

```typescript
spinner.stop();
process.stdout.write(output + "\n"); // print line
if (child.exitCode === null) {
  spinner.start("Translating..."); // resume only if process is still running
}
```

---

### Lifecycle

```
spawn(command, args)
│
├─ stdout/stderr data events -> buffer -> split on '\n' -> queueLine()
│                                                              │
│                                              processLine() -> limit(() => translate(line))
│                                                              ├─ translated? print translated
│                                                              └─ error? print original
│
└─ 'close' event
    ├─ flush remaining buffers
    ├─ await Promise.all(pendingTranslations)    <- wait for all in-flight translations
    ├─ spinner.stop()
    └─ process.exit(code || 0)                  <- propagate child exit code
```

---

### Error Handling

The `child.on('error')` event handles cases where the command itself cannot be started (e.g., command not found, permission denied). In this case:

- The spinner is stopped.
- An error is logged.
- The promise is rejected (bubbled up to `index.ts`).

Individual line translation failures are swallowed in `processLine` — the original line is printed instead.

---

## Example Flow

```bash
lingo --lang es npm test
```

1. `index.ts` calls `execWithTranslation('npm', ['test'])`.
2. `npm test` is spawned; its stdout/stderr are piped.
3. Lines like `"✓ should add numbers"` are captured and translated to `"✓ debería sumar números"`.
4. Translated lines are printed as they arrive.
5. When `npm test` exits, all pending translations are flushed, and the process exits with the same code.

---

## Related Modules

- [`cli/index.ts`](./index.md) — calls `execWithTranslation`
- [`cli/formatter.ts`](./formatter.md) — provides `format.spinner`
- [`shared/translator.ts`](../shared/translator.md) — translates individual lines
- [`shared/utils.ts`](../shared/utils.md) — provides `pLimit` for concurrency control
- [`shared/config.ts`](../shared/config.md) — provides target language setting
