# `extension/src/searcher.ts`

> **Role**: Performs web searches using the [Serper.dev](https://serper.dev) Google Search API and returns structured results for a specified language and region.

**Source**: [`extension/src/searcher.ts`](../../packages/extension/src/searcher.ts)  
**Called by**: [`extension/src/background.ts`](./background.md)

---

## Overview

`searcher.ts` provides a thin, typed wrapper around the Serper API. Serper is a Google Search API provider that accepts a search query, country code, and language code, returning structured search results in JSON.

This module is called **multiple times in parallel** from `background.ts` — once per target region (e.g., once for English/US, once for Spanish/ES) — allowing Linguastik to aggregate results from different parts of the world.

---

## Interface: `SearchResult`

Represents a single standardized search result:

| Field        | Type     | Description                                              |
| ------------ | -------- | -------------------------------------------------------- |
| `title`      | `string` | The page title of the search result                      |
| `url`        | `string` | The full URL of the result                               |
| `snippet`    | `string` | The short descriptive excerpt shown in search results    |
| `displayUrl` | `string` | The URL used for display (same as `url` currently)       |
| `language`   | `string` | Language code associated with this result (e.g., `'ja'`) |

---

## Function: `fetchSearchResults(query, language, googleDomain)`

| Parameter      | Type     | Description                                                       |
| -------------- | -------- | ----------------------------------------------------------------- |
| `query`        | `string` | The (already-translated) search query                             |
| `language`     | `string` | Language code for search results (`hl` parameter, e.g., `'ja'`)   |
| `googleDomain` | `string` | Country code for the Google domain (`gl` parameter, e.g., `'jp'`) |

**Returns**: `Promise<SearchResult[]>` — an array of up to 10 structured results.

**Throws**: If the Serper API key is missing or if the API call fails.

---

### API Request

```typescript
POST https://google.serper.dev/search
Headers:
  X-API-KEY: <serperApiKey>
  Content-Type: application/json
Body:
{
  "q": "npm install error",   // the translated query
  "gl": "jp",                  // google country domain
  "hl": "ja",                  // result language
  "num": 10                    // max results
}
```

---

### Response Mapping

The raw Serper response's `organic` array is mapped to the `SearchResult` interface:

```typescript
return (data.organic || []).map((result) => ({
  title: result.title,
  url: result.link,
  snippet: result.snippet,
  displayUrl: result.link,
  language: language,
}));
```

The `language` field is carried through from the function parameter to allow downstream components to distinguish which region a result came from.

---

### Error Handling

| Condition                          | Behavior                                                |
| ---------------------------------- | ------------------------------------------------------- |
| `config.serperApiKey` is undefined | Throws `Error('Serper API Key is missing')`             |
| API returns non-OK status          | Throws with the raw response text                       |
| Network error                      | Caught, re-thrown with context identifying the language |

All errors are intentionally thrown (not swallowed) so that `background.ts` can catch them and relay a `SEARCH_ERROR` message to the content script.

---

## Private Helper: `getCountryCode(language)`

A convenience mapping from language code to Google country code:

| Language | Country Code |
| -------- | ------------ |
| `en`     | `us`         |
| `ja`     | `jp`         |
| `de`     | `de`         |
| `fr`     | `fr`         |
| `es`     | `es`         |

> **Note**: This helper exists in the file but is not currently used by `fetchSearchResults` — the `googleDomain` mapping is handled in `background.ts` with a more complete map.

---

## Related Modules

- [`background.ts`](./background.md) — calls `fetchSearchResults` for each target region
- [`aggregator.ts`](./aggregator.md) — receives arrays of `SearchResult` to merge
- [`extension/src/shims/config.ts`](../../packages/extension/src/shims) — provides `lingoApiKey` and `serperApiKey`
