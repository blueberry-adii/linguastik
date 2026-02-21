# `shared/src/config.ts`

> **Role**: Centralized configuration manager for the Linguastik CLI. Loads, validates, persists, and provides access to user settings.

**Source**: [`shared/src/config.ts`](../../shared/src/config.ts)  
**Used by**: `translator.ts`, `explainer.ts`, `wrapper.ts` (CLI)

---

## Overview

`ConfigManager` is responsible for managing all user-facing settings — primarily the Lingo.dev API key and the target translation language. It ensures settings persist across CLI sessions and supports flexible overrides via environment variables, which is useful for CI/CD pipelines and scripting.

---

## File Locations

| Constant      | Value                      | Description                                            |
| ------------- | -------------------------- | ------------------------------------------------------ |
| `CONFIG_DIR`  | `~/.lingo-dev`             | Root configuration directory in the user's home folder |
| `CONFIG_FILE` | `~/.lingo-dev/config.json` | The primary persisted settings file                    |

The config file is a plain JSON formatted with 2-space indentation:

```json
{
  "apiKey": "api_39xksd...",
  "targetLang": "ja"
}
```

---

## Config Schema

Validated with `zod`. The type `Config` is inferred from:

```typescript
const ConfigSchema = z.object({
  apiKey: z.string().optional(),
  targetLang: z.string().default("en"),
});
```

| Field        | Type                | Default     | Description                                             |
| ------------ | ------------------- | ----------- | ------------------------------------------------------- |
| `apiKey`     | `string` (optional) | `undefined` | Lingo.dev API key for translation                       |
| `targetLang` | `string`            | `'en'`      | BCP-47 language code for output (e.g. `ja`, `es`, `fr`) |

---

## Configuration Source Priority

Settings are resolved in the following order (highest to lowest priority):

```
1. Environment Variables  ->  LINGO_API_KEY, LINGO_TARGET_LANG
2. ~/.lingo-dev/config.json
3. Hardcoded defaults     ->  { targetLang: 'en' }
```

This means setting `LINGO_API_KEY` in a `.env` file or shell profile takes precedence over anything stored in the config file, making it easy to manage keys for automated workflows.

---

## Class: `ConfigManager`

### `constructor()`

**Behavior**:

1. Calls `ensureConfigDir()` to create `~/.lingo-dev` if it doesn't exist.
2. Calls `loadConfig()` to populate `this.config`.

---

### `get(): Config`

**Returns**: The full current configuration object `{ apiKey?, targetLang }`.

```typescript
const { targetLang } = configManager.get();
```

---

### `set(key, value)`

| Parameter | Type           | Description                                               |
| --------- | -------------- | --------------------------------------------------------- |
| `key`     | `keyof Config` | The config field to update (`'apiKey'` or `'targetLang'`) |
| `value`   | `any`          | The new value for the field                               |

**Behavior**: Updates the in-memory config and immediately calls `saveConfig()` to persist to disk. This means every call to `set()` writes to the disk — intended for infrequent settings updates.

```typescript
// Setting the API key from CLI option --key
configManager.set("apiKey", "api_234xska...");

// Setting target language from --lang option
configManager.set("targetLang", "es");
```

---

### `getApiKey(): string | undefined`

A convenience accessor for the API key.

**Returns**: The API key string if configured, otherwise `undefined`.

```typescript
if (!configManager.getApiKey()) {
  console.warn("No API key found. Translation will be disabled.");
}
```

---

## Private Methods

### `ensureConfigDir()`

Uses `fs.mkdirSync(CONFIG_DIR, { recursive: true })` if the directory doesn't exist yet.

### `loadConfig(): Config`

Follows the priority order described above:

1. If `process.env.LINGO_API_KEY` is set -> returns an inline config using env vars.
2. If `CONFIG_FILE` exists -> reads, parses, and validates with `ConfigSchema.parse()`.
3. Falls back to `defaultConfig` (`{ targetLang: 'en' }`).

### `saveConfig()`

Serializes `this.config` to JSON and writes it to `CONFIG_FILE`. Errors are caught and logged with `console.error`.

---

## Singleton Export

```typescript
export const configManager = new ConfigManager();
```

One instance is created at module load time and shared across all components in the `@linguastik/shared` package.

---

## Related Modules

- [`translator.ts`](./translator.md) — reads `targetLang` and `apiKey`
- [`explainer.ts`](./explainer.md) — reads `targetLang` for localized explanations
- [`cli/index.ts`](../cli/index.md) — calls `configManager.set()` when `--key` or `--lang` flags are provided
