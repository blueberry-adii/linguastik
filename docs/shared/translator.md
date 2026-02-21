# `shared/src/translator.ts`

> **Role**: Core translation engine for the CLI, wrapping the Lingo.dev SDK with intelligent caching, input validation, and graceful fallbacks.

**Source**: [`shared/src/translator.ts`](../../shared/src/translator.ts)  
**Used by**: [`cli/src/wrapper.ts`](../../docs/cli/wrapper.md)

---

## Overview

The `Translator` class is the bridge between Linguastik's command wrapping pipeline and the external [Lingo.dev](https://lingo.dev) translation service. It is designed for **high throughput, low latency** use: when a terminal command is outputting dozens of lines per second, each line passes through this class.

Key design goals:

- **Never crash the pipeline**: All errors are swallowed, and the original text is returned as a fallback.
- **Maximize cache hits**: Before any API call, the translation cache is consulted.
- **Skip useless translations**: Empty strings or very short tokens are returned as-is.

---

## Class: `Translator`

### `constructor()`

**Behavior**:

- Retrieves the API key via `configManager.getApiKey()`.
- Instantiates `LingoDotDevEngine` with `apiKey || 'dummy-key'`. The dummy key prevents an SDK crash during initialization; actual API calls will still fail gracefully if the real key is missing.

> **Note**: The SDK is initialized once at module load via the singleton export. This avoids re-creating the engine on every translation call.

---

### `translate(text: string): Promise<string>`

The primary method for translating a line of terminal output.

| Parameter | Type     | Description                                              |
| --------- | -------- | -------------------------------------------------------- |
| `text`    | `string` | The string to translate (a single line of stdout/stderr) |

**Returns**: The translated text, or the original `text` on failure/skip.

#### Full Decision Flow

```
translate(text)
│
├─ Look up in cache (text, 'auto', targetLang)
│   └─ CACHE HIT → return cached translation immediately
│
├─ Guard: text is empty or < 2 chars → return text as-is
│
├─ Guard: no API key configured → return text as-is
│
├─ Call lingo.localizeText(text, { sourceLocale: 'auto', targetLocale: targetLang })
│   ├─ SUCCESS → store in cache → return translated text
│   └─ ERROR   → catch silently → return original text
│
└─ (returns text in all fallback cases)
```

```typescript
// Internal example from wrapper.ts
const translated = await translator.translate(line);
const output = translated && translated.trim().length > 0 ? translated : line;
process.stdout.write(output + "\n");
```

---

## Lingo.dev SDK Integration

The class uses `LingoDotDevEngine.localizeText()`, which translates free-form text with automatic source language detection:

```typescript
const translatedText = await this.lingo.localizeText(text, {
  sourceLocale: "auto", // auto-detect source language
  targetLocale: targetLang, // e.g. 'ja', 'es', 'fr'
});
```

The `targetLocale` is always fetched fresh from `configManager.get().targetLang` on each call, allowing real-time language switching without restarting the process.

---

## Error Resilience

All API calls are wrapped in try/catch. If Lingo.dev returns an error (network failure, invalid key, rate limit), the class silently falls back to returning the original text. This is intentional — the CLI should never crash or hang due to a translation failure.

---

## Singleton Export

```typescript
export const translator = new Translator();
```

This singleton is imported by `wrapper.ts` in the CLI. All translation calls within a single CLI invocation share one engine instance and benefit from the same shared cache.

---

## Related Modules

- [`cache.ts`](./cache.md) — provides the `translationCache` singleton used here
- [`config.ts`](./config.md) — supplies the API key and target language
- [`cli/wrapper.ts`](../cli/wrapper.md) — calls `translator.translate()` for each line of output
- [`extension/translator.ts`](../extension/translator.md) — a browser-compatible counterpart with similar design
