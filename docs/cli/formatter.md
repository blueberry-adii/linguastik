# `cli/src/formatter.ts`

> **Role**: Centralized console output utilities for the Linguastik CLI. Provides consistent styling for status messages, error boxes, and spinners.

**Source**: [`cli/src/formatter.ts`](../../packages/cli/src/formatter.ts)  
**Used by**: [`cli/src/index.ts`](../../docs/cli/index.md), [`cli/src/wrapper.ts`](../../docs/cli/wrapper.md)

---

## Overview

`formatter.ts` exports a single `format` object containing utility functions that produce styled terminal output. Using a single shared formatter keeps all visual language consistent across the CLI and avoids scattering raw `chalk` / `boxen` / `ora` calls throughout the codebase.

### Dependencies

| Library                                          | Purpose                            |
| ------------------------------------------------ | ---------------------------------- |
| [`chalk`](https://github.com/chalk/chalk)        | ANSI color codes for terminal text |
| [`boxen`](https://github.com/sindresorhus/boxen) | Bordered/boxed terminal messages   |
| [`ora`](https://github.com/sindresorhus/ora)     | Animated terminal spinners         |

---

## `format` Object Methods

### `format.success(msg: string): string`

Prefixes a message with a green `✔` checkmark.

| Parameter | Type     | Description                    |
| --------- | -------- | ------------------------------ |
| `msg`     | `string` | The success message to display |

```typescript
console.log(format.success("API key updated successfully."));
// Output: ✔ API key updated successfully.  (in green)
```

---

### `format.error(msg: string): string`

Prefixes a message with a red `✖` cross.

```typescript
console.error(format.error(`Execution failed: ${err.message}`));
// Output: ✖ Execution failed: command not found  (in red)
```

---

### `format.warn(msg: string): string`

Prefixes a message with a yellow `⚠` warning sign.

```typescript
console.log(format.warn("No API key found. Translation will be disabled."));
// Output: ⚠ No API key found. Translation will be disabled.  (in yellow)
```

---

### `format.info(msg: string): string`

Prefixes a message with a blue `ℹ` info symbol.

```typescript
console.log(format.info("Run `lingo --key <your-api-key>` to set it."));
// Output: ℹ Run `lingo --key <your-api-key>` to set it.  (in blue)
```

---

### `format.dim(msg: string): string`

Renders a message in gray (dimmed) text. Used for secondary/contextual details.

```typescript
console.log(format.dim(`Tool: ${explanation.tool}`));
// Output: git  (in gray)
```

---

### `format.box(title, content, color?): string`

Renders a titled, bordered box using `boxen`. Used exclusively for structured error explanations.

| Parameter | Type                                     | Default  | Description                 |
| --------- | ---------------------------------------- | -------- | --------------------------- |
| `title`   | `string`                                 | —        | The box header text         |
| `content` | `string`                                 | —        | The body, may be multi-line |
| `color`   | `'green' \| 'red' \| 'yellow' \| 'blue'` | `'blue'` | Border color                |

**Box configuration**:

- `borderStyle: 'round'`
- `padding: 1`
- `margin: 1`
- `titleAlignment: 'left'`

```typescript
console.log(
  format.box(
    "[ERROR] Permission Denied",
    "npm cannot write to /usr/local/lib...",
    "red"
  )
);
```

Produces output like:

```
╭─ [ERROR] Permission Denied ─────────────────╮
│                                              │
│  npm cannot write to /usr/local/lib...       │
│                                              │
╰──────────────────────────────────────────────╯
```

---

### `format.spinner(text: string): ora.Ora`

Creates a new `ora` spinner instance (does **not** start it automatically).

| Parameter | Type     | Description                                       |
| --------- | -------- | ------------------------------------------------- |
| `text`    | `string` | The message shown alongside the spinner animation |

**Returns**: An `ora` spinner instance with `.start()`, `.stop()`, `.succeed()`, `.fail()` methods.

```typescript
const spinner = format.spinner(`Running ${command}...`).start();
// ... do work ...
spinner.stop();
```

> **Why not `ora` directly?** Centralizing spinner creation in `format.spinner()` makes it easier to swap out the animation library in future without touching the callers.

---

## Related Modules

- [`cli/index.ts`](./index.md) — uses `format.success`, `format.warn`, `format.info`, `format.error`, `format.box`, `format.dim`
- [`cli/wrapper.ts`](./wrapper.md) — uses `format.spinner`
