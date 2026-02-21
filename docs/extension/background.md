# `extension/src/background.ts`

> **Role**: The central service worker (background script) of the Linguastik browser extension. It orchestrates all cross-origin API calls, coordinates parallel searches, and routes messages between the popup, content script, and external services.

**Source**: [`extension/src/background.ts`](../../packages/extension/src/background.ts)

---

## Overview

In Manifest V3 Chrome extensions, background scripts run as **service workers** — they have no DOM access but can make `fetch` requests that content scripts cannot (due to CORS restrictions). Linguastik uses this to perform:

- Multi-region Google searches via the Serper API
- Text translation via the Lingo.dev REST API
- Image analysis via the Google Gemini API

All results are then sent back to the active tab's content script for rendering in the sidebar.

---

## Message Protocol

The background script listens for messages on `chrome.runtime.onMessage` and dispatches to specific handlers based on `message.type`:

| Message Type          | Sender                   | Handler                    | Description                         |
| --------------------- | ------------------------ | -------------------------- | ----------------------------------- |
| `NEW_SEARCH`          | `content.ts`, `popup.ts` | `handleSearch()`           | Trigger a full multi-lingual search |
| `TRANSLATE_SELECTION` | `content.ts`             | `handleQuickTranslation()` | Translate a selected text snippet   |
| `IDENTIFY_OBJECT`     | `popup.ts`               | inline async               | Analyze an image with Gemini AI     |

All handlers return `true` to signal that the response is asynchronous.

---

## `handleSearch(query, tabId)`

The primary orchestration function. Following a step-by-step pipeline:

```
handleSearch(query, tabId)
│
├─ 1. Send SEARCH_LOADING -> tab (show spinner in sidebar)
│
├─ 2. Load config (serperApiKey, lingoApiKey, foreignLanguage, userLanguage)
│
├─ 3. Detect output language
│    ├─ userLanguage === 'auto' -> call translator.detectLanguage(query)
│    └─ userLanguage set        -> use directly
│
├─ 4. Determine target regions: [foreignLanguage, 'en'] or just ['en']
│
├─ 5. For each region -> translator.translate(query, region)
│    (translates query into each target region's language)
│
├─ 6. For each region -> fetchSearchResults(translatedQuery, lang, country)
│    (parallel Serper API calls)
│
├─ 7. aggregateResults(searchResults)
│    -> round-robin merge into combined list
│
├─ 8. For top 10 results -> translator.translate(result.title, outputLang)
│    (localize result titles for the user)
│
├─ 9. Generate summary:
│    -> translator.generateSummary(top 10 snippets, outputLang)
│
└─ 10. Send SEARCH_RESULTS -> tab (with results, summary, regions)
```

**Parameters**:

| Parameter | Type     | Description                              |
| --------- | -------- | ---------------------------------------- |
| `query`   | `string` | The original search query from the user  |
| `tabId`   | `number` | Chrome tab ID to send result messages to |

---

### Language & Region Mapping

The background script uses a hardcoded `map` to translate language codes to country codes for Serper:

```typescript
const map = {
  en: "us",
  ja: "jp",
  de: "de",
  fr: "fr",
  es: "es",
  hi: "in",
  it: "it",
  pt: "br",
  ru: "ru",
  zh: "cn",
  ko: "kr",
  ar: "sa",
};
```

---

## `handleQuickTranslation(text)`

A simpler handler for when a user selects text and clicks the floating translate button.

| Parameter | Type     | Description                    |
| --------- | -------- | ------------------------------ |
| `text`    | `string` | The selected text to translate |

**Flow**:

1. Loads config, resolves `targetLang` from `userLanguage` (if `'auto'`, defaults to `'en'`).
2. Calls `translator.translate(text, targetLang)`.
3. Returns `{ translation, lang }` to the caller via `sendResponse`.

---

## `IDENTIFY_OBJECT` Handler (Vision AI)

Handles image-based search initiation from the popup.

**Payload**:

| Field    | Type     | Description                    |
| -------- | -------- | ------------------------------ |
| `image`  | `string` | Base64-encoded JPEG image data |
| `apiKey` | `string` | User's Google Gemini API key   |

**Flow**:

1. Dynamically imports `@google/genai` (lazy import to avoid load-time overhead).
2. Sends image and a prompt to the `gemini-2.5-flash` model:
   > _"Analyze this image and generate a concise search query... Return ONLY a JSON object with 'query' and 'confidence'."_
3. Strips any markdown code fences from the response.
4. Parses the JSON and returns `{ success: true, data: { query, confidence } }` to the popup.
5. On model-not-found errors, attempts to list available models for debugging.

---

## Error Handling

| Scenario                          | Behavior                                                              |
| --------------------------------- | --------------------------------------------------------------------- |
| Missing Serper API key            | `fetchSearchResults` throws -> caught -> `SEARCH_ERROR` sent to tab   |
| Translation failure               | `translator.translate` returns `null` -> falls back to original query |
| Gemini API error                  | Error caught -> `{ success: false, error: err.message }` returned     |
| Missing `tabId`                   | Logs a warning and does nothing                                       |
| `SEARCH_ERROR` from orchestration | `chrome.tabs.sendMessage(tabId, { type: 'SEARCH_ERROR', error })`     |

---

## Related Modules

- [`searcher.ts`](./searcher.md) — performs region-specific web searches
- [`aggregator.ts`](./aggregator.md) — merges multi-region results
- [`translator.ts`](./translator.md) — translates queries, titles, and summaries
- [`content.ts`](./content.md) — receives `SEARCH_RESULTS` and renders the sidebar
- [`popup.ts`](./popup.md) — sends `NEW_SEARCH` and `IDENTIFY_OBJECT` messages
