# `extension/src/translator.ts`

> **Role**: Browser-compatible translation layer for the extension. Wraps the Lingo.dev REST API directly using `fetch`, providing translation, language detection, and summary generation.

**Source**: [`extension/src/translator.ts`](../../packages/extension/src/translator.ts)  
**Used by**: [`extension/src/background.ts`](../../docs/extension/background.md)

---

## Overview

The extension cannot use the `@linguastik/shared` Translator directly because the Lingo.dev Node.js SDK uses Node-specific APIs (`fs`, `os`, etc.) unavailable in a browser context. This file re-implements the same translation contract using the browser-native `fetch` API and `chrome.storage` for config access.

**Base URL**: `https://engine.lingo.dev`

---

## Class: `ExtensionTranslator`

### `translate(text, targetLang): Promise<string | null>`

Translates a string to a given target language.

| Parameter    | Type     | Description                                      |
| ------------ | -------- | ------------------------------------------------ |
| `text`       | `string` | The text to translate                            |
| `targetLang` | `string` | BCP-47 target locale code (e.g., `'ja'`, `'es'`) |

**Returns**: The translated string or `null` on failure.

#### API Call

```typescript
POST https://engine.lingo.dev/i18n
Authorization: Bearer <lingoApiKey>
Content-Type: application/json

{
  "params": {
    "workflowId": "<crypto.randomUUID()>",
    "fast": true
  },
  "locale": {
    "source": "auto",
    "target": "ja"
  },
  "data": {
    "text": "Error: Cannot read properties of undefined"
  }
}
```

| Field            | Description                                                                      |
| ---------------- | -------------------------------------------------------------------------------- |
| `workflowId`     | A unique UUID generated per call, used for request tracing on the Lingo.dev side |
| `fast: true`     | Requests a faster (potentially lower quality) translation mode                   |
| `source: "auto"` | Instructs Lingo.dev to auto-detect the source language                           |

**Response**: `{ data: { text: "<translated string>" } }`

#### Error Handling

| Condition             | Behavior                           |
| --------------------- | ---------------------------------- |
| `lingoApiKey` missing | Logs error, returns `null`         |
| Non-OK HTTP status    | Logs status + body, returns `null` |
| Network failure       | Catches and logs, returns `null`   |

---

### `detectLanguage(text): Promise<string>`

Detects the language of a given text string.

| Parameter | Type     | Description        |
| --------- | -------- | ------------------ |
| `text`    | `string` | The text to detect |

**Returns**: BCP-47 locale code string (e.g., `'fr'`), or `'en'` as a fallback.

#### API Call

```typescript
POST https://engine.lingo.dev/recognize
Authorization: Bearer <lingoApiKey>
Content-Type: application/json

{ "text": "<input text>" }
```

**Response**: `{ locale: "fr" }`

**Usage**: Called by `background.ts` when `userLanguage === 'auto'` to determine the output language from the query itself.

---

### `generateSummary(texts, targetLang): Promise<string>`

Generates a translated summary from an array of text snippets (search result descriptions).

| Parameter    | Type       | Description                                     |
| ------------ | ---------- | ----------------------------------------------- |
| `texts`      | `string[]` | Array of text snippets (search result snippets) |
| `targetLang` | `string`   | Target language for the summary                 |

**Returns**: A translated summary string, or a fallback message on failure.

**Implementation**:

```typescript
const combined = texts.slice(0, 3).join("\n\n");
const translation = await this.translate(combined, targetLang);
return translation || "Summary unavailable (Translation failed).";
```

Takes only the first 3 snippets to keep the payload small. Delegates to `translate()` rather than a dedicated summary endpoint.

---

### `translateHtml(html, targetLang): Promise<string | null>`

Translates an HTML string while preserving its tag structure. Used by the inline select-to-translate feature so that **bold**, **links**, **images**, and other inline elements remain intact in the translated output.

| Parameter    | Type     | Description                                       |
| ------------ | -------- | ------------------------------------------------- |
| `html`       | `string` | Inner HTML of the selected wrapper span           |
| `targetLang` | `string` | BCP-47 target locale code (e.g., `'en'`, `'es'`) |

**Returns**: Translated HTML string, or `null` on failure.

#### API Call

```typescript
POST https://engine.lingo.dev/i18n
Authorization: Bearer <lingoApiKey>

{
  "params": { "workflowId": "<uuid>", "fast": true },
  "locale": { "source": "auto", "target": "en" },
  "data": {
    "html": "<strong>太字テキスト</strong> 普通のテキスト"
  }
}
```

**Response**: `{ data: { html: "<strong>Bold text</strong> Normal text" } }`

The Lingo.dev API translates only the text nodes inside the HTML and returns the same tag structure unchanged.

---

## Comparison: Extension vs. Shared Translator

| Feature              | `shared/translator.ts`            | `extension/translator.ts`              |
| -------------------- | --------------------------------- | -------------------------------------- |
| SDK                  | `LingoDotDevEngine` (Node.js SDK) | Direct `fetch` to REST API             |
| Config Access        | `configManager.get()` (fs-based)  | `chrome.storage.sync` (extension shim) |
| Caching              | Two-tier (memory + disk)          | None (stateless per call)              |
| Language Detection   | Not supported                     | `/recognize` endpoint                  |
| Summary Generation   | Not supported                     | Via `translate()` on joined snippets   |
| HTML Translation     | Not supported                     | `translateHtml()` via `data.html`      |
| Environment          | Node.js (CLI)                     | Browser (Manifest V3 Service Worker)   |

---

## Singleton Export

```typescript
export const translator = new ExtensionTranslator();
```

Used exclusively in `background.ts`.

---

## Related Modules

- [`background.ts`](../../docs/extension/background.md) — calls all three methods on this class
- [`extension/src/shims/config.ts`](../../packages/extension/src/shims/config.ts) — provides `configManager.load()` for API key retrieval
- [`shared/translator.ts`](../../docs/shared/translator.md) — the Node.js counterpart with caching
