# `extension/src/content.ts`

> **Role**: The content script injected into web pages. It creates the Linguastik sidebar UI, monitors search queries, and handles text selection for quick translation.

**Source**: [`extension/src/content.ts`](../../packages/extension/src/content.ts)  
**Runs in**: The context of the active web page (Google, Bing, etc.)

---

## Overview

Content scripts are sandboxed — they can modify the DOM of a web page, listen to user events, and communicate with the background script, but cannot make cross-origin `fetch` calls. The content script's responsibility is purely **UI and event management**; all data processing is delegated to `background.ts`.

---

## Initialization Guard

```typescript
if ((window as any).hasLingoContentScriptLoaded) {
  console.log("Already loaded. Skipping initialization.");
}
(window as any).hasLingoContentScriptLoaded = true;
```

This guard prevents the script from initializing more than once if it gets injected multiple times (which can happen with Chrome's scripting API).

---

## Search Detection

### `getQueryFromURL(): string`

Parses the `q` parameter from the current URL's query string.

```typescript
const params = new URLSearchParams(window.location.search);
return params.get("q") || "";
```

Works with any search engine that uses the standard `?q=` parameter (Google, Bing, DuckDuckGo, etc.).

---

### URL Polling (1-second interval)

Single-page apps like Google Search update the URL without a full page reload. A polling interval checks for URL changes:

```typescript
setInterval(() => {
  const current = getQueryFromURL();
  if (current && current !== lastQuery) {
    lastQuery = current;
    checkEnabledAndSearch(current);
  }
}, 1000);
```

This ensures that when a user performs a new search, Linguastik reacts within one second.

---

### `checkEnabledAndSearch(query)`

Checks if the extension is enabled in `chrome.storage.sync` before proceeding. If the user has toggled off the extension in the popup, the search flow is skipped silently.

---

## Sidebar Injection

### `createSidebarIfNeeded(query?: string)`

Creates the entire Linguastik UI if it hasn't been injected yet. Uses a **Shadow DOM** to ensure that the extension's styles are completely isolated from the host website.

**Structure injected into `document.body`**:

```
<div id="linguastik-lens-host"> (position: fixed, z-index: max, pointer-events: none)
  #shadow-root
    ├─ <style>  <- all Linguastik CSS
    ├─ .sidebar          (right panel — search results)
    ├─ .sidebar-left     (left panel — quick translate)
    ├─ .toggle-btn       (right edge floating button)
    └─ .toggle-btn-left  (left edge floating button)
```

The host element itself has `pointer-events: none` to prevent it from blocking clicks on the underlying page. Individual sidebar elements re-enable `pointer-events: auto`.

**Shadow DOM is used because**:

- The host website's CSS (e.g., `* { box-sizing: border-box; }`) would break Linguastik's styles.
- JavaScript from the host page cannot accidentally access or modify Linguastik's internal DOM.

---

### `handleNewSearch(query)`

Called whenever a new search is detected. It:

1. Sends a `NEW_SEARCH` message to the background script.
2. Calls `createSidebarIfNeeded(query)` to ensure the sidebar exists.
3. Makes the sidebar visible.
4. Renders the loading state via `renderLoading(query)`.

---

## Message Handlers

### `SEARCH_RESULTS`

Received from `background.ts` after the multi-lingual search is complete.

- Calls `renderSidebar(message.data)` and injects the HTML into `#result-content`.
- Updates the region tag pills in the header.
- Hides the translation overlay.

### `SEARCH_ERROR`

Received when something fails in the background.

- Calls `renderError(message.error)` and injects the HTML.

### `SEARCH_LOADING`

Received when the background is about to start processing.

- Creates the sidebar if it doesn't exist.
- Makes the sidebar visible.
- Shows the loading state and translating overlay.

---

## Text Selection & Quick Translation

### Event Listeners

| Event                       | Handler                               |
| --------------------------- | ------------------------------------- |
| `mouseup`                   | `handleSelection()`                   |
| `keyup` (Shift, Arrow keys) | `handleSelection()`                   |
| `scroll`                    | `removeFloatingButton()`              |
| `selectionchange`           | `removeFloatingButton()` if collapsed |

### `handleSelection()`

Checks if the user has selected (highlighted) text. If so, computes the bounding rectangle of the selection and calls `showFloatingButton(x, y, text)`.

### `showFloatingButton(x, y, text)`

Injects a floating translate button into the shadow DOM near the selected text. On click:

- The selection is preserved.
- `removeFloatingButton()` is called.
- `showTranslationInSidebar(text)` is triggered.

### `showTranslationInSidebar(text)`

1. Opens the left sidebar.
2. Shows a "Translating..." placeholder.
3. Activates the loading overlay.
4. Sends a `TRANSLATE_SELECTION` message to the background script.
5. On response, renders the translated text with the language name and the original text as a preview.

---

## Language Map

```typescript
const LANG_MAP: Record<string, string> = {
  'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
  'it': 'Italian', 'pt': 'Portuguese', 'ru': 'Russian', 'zh': 'Chinese',
  'ja': 'Japanese', 'ko': 'Korean', 'hi': 'Hindi', 'ar': 'Arabic', ...
};
```

Used by `getLangName(code)` to display a human-readable language name in the translation result card.

---

## Related Modules

- [`background.ts`](../../docs/extension/background.md) — receives `NEW_SEARCH` and `TRANSLATE_SELECTION` messages
- [`extension/src/ui/sidebar.ts`](../../packages/extension/src/ui/sidebar.ts) — `renderSidebar`, `renderLoading`, `renderError` HTML generators
- [`extension/src/ui/styles.ts`](../../packages/extension/src/ui/styles.ts) — CSS string injected into the Shadow DOM
