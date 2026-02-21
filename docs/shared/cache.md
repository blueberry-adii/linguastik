# `shared/src/cache.ts`

> **Role**: Two-tiered translation caching layer (memory + disk) used by both the CLI and browser extension to prevent redundant API calls and reduce latency.

**Source**: [`shared/src/cache.ts`](../../shared/src/cache.ts)  
**Used by**: [`shared/src/translator.ts`](../../shared/src/translator.ts)

---

## Overview

At high output rates (e.g., a fast `npm install` or a verbose build tool), the CLI can generate hundreds of translatable lines per second. Without caching, each line would trigger a fresh API call. `TranslationCache` solves this by maintaining two layers of storage:

1. **In-memory** (via `node-cache`): Fast lookups for frequently recurring or recently translated strings. Expires automatically via TTL.
2. **On-disk** (JSON files): Persistent storage that survives process restarts. Organized into shards for file-system efficiency.

---

## Cache Architecture

```
~/.lingo-dev/cache/
└── translations/
    ├── a1/         <- shard (first 2 chars of MD5 hash)
    │   └── a1b2c3....json
    ├── d4/
    │   └── d4e5f6....json
    └── ...
```

Each JSON file stores one translation entry:

```json
{
  "original": "Error: module not found",
  "translation": "エラー: モジュールが見つかりません",
  "sourceLang": "auto",
  "targetLang": "ja",
  "timestamp": 1708515600000
}
```

---

## Class: `TranslationCache`

### `constructor(ttlSeconds?: number)`

| Parameter    | Type     | Default | Description                                  |
| ------------ | -------- | ------- | -------------------------------------------- |
| `ttlSeconds` | `number` | `3600`  | TTL for in-memory cache entries (in seconds) |

**Behavior**:

- Instantiates `NodeCache` with the provided TTL.
- Calls `ensureCacheDirs()` to create `~/.lingo-dev/cache/translations/` if it doesn't already exist.

---

### `get(text, sourceLang, targetLang): string | null`

Retrieves a cached translation using a compound cache key.

| Parameter    | Type     | Description                           |
| ------------ | -------- | ------------------------------------- |
| `text`       | `string` | The source text to look up            |
| `sourceLang` | `string` | Source language code (e.g., `'auto'`) |
| `targetLang` | `string` | Target language code (e.g., `'ja'`)   |

**Returns**: The cached translated string, or `null` if no cache entry exists.

**Lookup Strategy** (in order of priority):

1. Compute `hash = MD5(text + ":" + sourceLang + ":" + targetLang)`
2. Check `nodeCache.get(hash)` — returns immediately if found
3. Determine disk path: `~/.lingo-dev/cache/translations/<hash[0:2]>/<hash>.json`
4. If file exists, parse it, update the memory cache, and return the translation
5. Return `null` if nothing is found

```typescript
// Usage (internal)
const cached = translationCache.get("Build failed", "auto", "es");
if (cached) {
  return cached; // skip API call
}
```

---

### `set(text, sourceLang, targetLang, translation)`

Stores a translation result in both the memory and disk cache.

| Parameter     | Type     | Description                  |
| ------------- | -------- | ---------------------------- |
| `text`        | `string` | The original source text     |
| `sourceLang`  | `string` | Source language code         |
| `targetLang`  | `string` | Target language code         |
| `translation` | `string` | The translated text to store |

**Storage Strategy**:

1. Updates the `node-cache` in-memory store.
2. Computes the shard directory path from the hash.
3. Writes a JSON file with the translation and metadata to disk.
4. Errors during disk write are logged but do not throw — translation pipeline is not disrupted.

---

## Private Methods

### `getHash(text, sourceLang, targetLang): string`

Generates an MD5 hex digest from the concatenation `"<text>:<sourceLang>:<targetLang>"`. This serves as a unique, file-system-safe key.

### `ensureCacheDirs()`

Creates the cache directory path recursively using `fs.mkdirSync(..., { recursive: true })` if it doesn't yet exist.

### `getFilePath(hash): string`

Computes the shard-based file path for a given hash. Uses the first 2 characters of the hash as the shard directory name, preventing filesystem slowdowns from thousands of files in a single directory.

---

## Singleton Export

```typescript
export const translationCache = new TranslationCache();
```

A single shared instance used by `translator.ts`. The TTL defaults to 1 hour.

---

## Related Modules

- [`translator.ts`](./translator.md) — consumes the cache before calling Lingo.dev
- [`config.ts`](./config.md) — defines the `CONFIG_DIR` root that the cache directory lives under
