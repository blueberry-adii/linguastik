# `extension/src/popup.ts`

> **Role**: Manages the extension popup UI — user configuration, API key management, Vision AI image-to-search, and popup UI localization.

**Source**: [`extension/src/popup.ts`](../../packages/extension/src/popup.ts)  
**HTML template**: [`extension/popup.html`](../../packages/extension/popup.html)

---

## Overview

`popup.ts` is the TypeScript controller for the extension popup — the settings interface visible when a user clicks the Linguastik icon in Chrome's toolbar. It handles:

- **Settings management**: Reading and writing API keys and language preferences to `chrome.storage.sync`.
- **UI Localization**: Dynamically translating all popup labels using Lingo.dev when the user selects a non-English interface language.
- **Vision Search**: Processing user-uploaded images with Gemini AI to generate a search query.

---

## Initialization

On popup open, the script immediately reads settings from `chrome.storage.sync`:

```typescript
chrome.storage.sync.get(
  [
    "serperApiKey",
    "lingoApiKey",
    "geminiApiKey",
    "foreignLanguage",
    "userLanguage",
    "enabled",
    "visionEnabled",
  ],
  (result) => {
    // Populate form fields
    // Restore Vision state
    // Trigger UI translation if non-English
    // Show "Settings Saved" banner if applicable
  }
);
```

---

## API Key Management

### `saveBtn` Click Handler

Saves the three API keys from the form inputs to `chrome.storage.sync`:

| Key            | Input ID        | Description                         |
| -------------- | --------------- | ----------------------------------- |
| `serperApiKey` | `#serperApiKey` | Serper.dev API key for web search   |
| `lingoApiKey`  | `#lingoApiKey`  | Lingo.dev API key for translation   |
| `geminiApiKey` | `#geminiApiKey` | Google Gemini API key for Vision AI |

On success, displays a temporary "Keys Saved!" status message that clears after 2 seconds.

---

## Language Settings

### `autoSaveSettings(shouldTranslate?: boolean)`

Reads and immediately saves the language and enabled state whenever they change:

| `chrome.storage.sync` key | Source Element              | Description                          |
| ------------------------- | --------------------------- | ------------------------------------ |
| `foreignLanguage`         | `#foreignLanguage` (select) | Target language for global search    |
| `userLanguage`            | `#userLanguage` (select)    | User's native language / UI language |
| `enabled`                 | `#enabled` (checkbox)       | Extension on/off toggle              |
| `visionEnabled`           | Eye button state            | Whether Vision AI panel is visible   |

If `shouldTranslate` is true (triggered by `userLanguage` change), the function calls `translateUI()` to refresh interface labels.

---

## UI Localization: `translateUI(targetLang, apiKey)`

Scans all elements with a `data-i18n` attribute and translates their text content using the Lingo.dev API.

### Flow

```
1. Collect all [data-i18n] elements
2. Save original text in data-original-text attribute (for cache key stability)
3. Build cache key: `lingo_ui_cache_v2_<targetLang>` -> check localStorage
4. Filter to items not yet in cache -> needsTranslation[]
5. Show #translationOverlay (loading spinner)
6. For each item -> POST to https://engine.lingo.dev/i18n
7. Store results in cache -> save to localStorage
8. Hide overlay
9. Apply translated text to all [data-i18n] elements
10. For RTL languages (ar, he, fa, ur) -> set dir="rtl" and text-align: right
```

### Caching Strategy

Translations are cached in `localStorage` with the key `lingo_ui_cache_v2_<targetLang>`. This means after the first popup open in a given language, subsequent opens are instant — no API calls needed unless the cache is cleared.

```typescript
const cacheKey = `lingo_ui_cache_v2_${targetLang}`;
const cached = localStorage.getItem(cacheKey);
let cache = cached ? JSON.parse(cached) : {};
```

---

## Vision Search Feature

### `eyeBtn` Toggle

Clicking the eye icon toggles the Vision container visibility and persists the `visionEnabled` state.

### `handleFileSelection(file: File)`

Validates that the selected file is an image (`file.type.startsWith('image/')`). Then:

1. Shows the preview UI (`#visionPreviewState`).
2. Reads file as a Data URL via `FileReader`.
3. Stores the Data URL in `localStorage` (for persistence across popup opens).
4. Calls `processImage(dataUrl)`.

### `processImage(dataUrl: string)`

Prepares the image for Gemini AI analysis:

**Step 1 — Resize**: Uses an HTML5 Canvas to resize any image larger than 800×800 pixels:

```typescript
const maxDim = 800;
canvas.width = newWidth;
canvas.height = newHeight;
ctx?.drawImage(img, 0, 0, newWidth, newHeight);
const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8);
```

Compression quality is set to `0.8` to balance payload size and visual fidelity.

**Step 2 — Gemini Request**: Sends an `IDENTIFY_OBJECT` message to the background script with the base64 JPEG data and the Gemini API key.

**Step 3 — Handle Response**: If successful, displays the detected search query and confidence score in the UI. Then calls `triggerSearchForQuery(query)` to initiate a search.

---

### `triggerSearchForQuery(query: string)`

Connects the Vision result to the search pipeline:

1. Queries `chrome.tabs` for the active tab.
2. Sends `SEARCH_LOADING` to the content script on that tab (to show the sidebar).
3. If the content script isn't loaded, injects it via `chrome.scripting.executeScript`.
4. Sends `NEW_SEARCH` to the background script with the query and the active tab's ID.

---

## State Persistence via `localStorage`

| Key                        | Description                                                          |
| -------------------------- | -------------------------------------------------------------------- |
| `visionImageData`          | Base64 Data URL of the last uploaded image                           |
| `visionImageName`          | Filename of the last uploaded image                                  |
| `visionAnalysisResult`     | JSON string of the Gemini analysis result                            |
| `lingo_ui_cache_v2_<lang>` | Localized UI text cache per language                                 |
| `show_settings_saved`      | Flag to trigger the "Settings Saved!" banner after a save-and-reload |

---

## Related Modules

- [`background.ts`](../../docs/extension/background.md) — receives `NEW_SEARCH` and `IDENTIFY_OBJECT` messages
- [`content.ts`](../../docs/extension/content.md) — receives `SEARCH_LOADING` to show the sidebar
- [`extension/src/shims/config.ts`](../../packages/extension/src/shims/config.ts) — the configuration shim used by other extension modules
