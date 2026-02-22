# `extension/src/content.ts`

> **Role**: The content script injected into web pages. It creates the Linguastik sidebar UI, monitors search queries, and handles text selection with inline translation.

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

Prevents the script from initializing more than once if injected multiple times.

---

## Search Detection

### `getQueryFromURL(): string`

Parses the `q` parameter from the current URL's query string. Works with any search engine that uses `?q=`.

### URL Polling (1-second interval)

Single-page apps like Google Search update the URL without a full page reload. A polling interval checks for URL changes and triggers a new search if the query changes.

### `checkEnabledAndSearch(query)`

Checks if the extension is enabled in `chrome.storage.sync` before proceeding. If the user has toggled off the extension in the popup, the search flow is skipped silently.

---

## Sidebar Injection

### `createSidebarIfNeeded(query?: string)`

Creates the Linguastik UI if it hasn't been injected yet. Uses a **Shadow DOM** to ensure the extension's styles are completely isolated from the host website.

**Structure injected into `document.body`**:

```
<div id="linguastik-lens-host"> (position: fixed, z-index: max, pointer-events: none)
  #shadow-root
    ├─ <style>       ← all Linguastik CSS
    ├─ .sidebar      (right panel — search results)
    └─ .toggle-btn   (right edge floating button)
```

The host element has `pointer-events: none`; individual sidebar elements re-enable `pointer-events: auto`.

**Shadow DOM is used because**:
- Host website CSS would break Linguastik's styles.
- Host page JavaScript cannot access Linguastik's internal DOM.

---

### `handleNewSearch(query)`

Called on new search detection. It:
1. Sends a `NEW_SEARCH` message to the background script.
2. Calls `createSidebarIfNeeded(query)` to ensure the sidebar exists.
3. Makes the sidebar visible and renders the loading state.

---

## Message Handlers

### `SEARCH_RESULTS`

Received after the multi-lingual search is complete.
- Calls `renderSidebar(message.data)` and injects the HTML into `#result-content`.
- Updates the region tag pills in the header.
- Hides the translation overlay.

### `SEARCH_ERROR`

Received when something fails in the background.
- Renders the error via `renderError(message.error)`.

### `SEARCH_LOADING`

Received when the background is about to start processing.
- Creates the sidebar if needed, makes it visible, shows the loading state.

---

## Text Selection — Inline Translation

When the user selects text on any page, a floating translate button appears near the selection. Clicking it **replaces the selected text in-place** with a translation, without opening any sidebar.

### Event Listeners

| Event                       | Handler                               |
| --------------------------- | ------------------------------------- |
| `mouseup`                   | `handleSelection()`                   |
| `keyup` (Shift, Arrow keys) | `handleSelection()`                   |
| `scroll`                    | `removeFloatingButton()`              |
| `selectionchange`           | `removeFloatingButton()` if collapsed |

### `handleSelection()`

Checks if the user has selected visible text. If so, computes the bounding rectangle and calls `showFloatingButton(x, y, text, range)`. The `Range` object is passed through so it can be cloned immediately (clicking the button clears the live selection).

### `showFloatingButton(x, y, text, range)`

Injects a floating translate button into the shadow DOM near the selected text. The range is cloned on creation. On click:
- The floating button is removed.
- `replaceSelectionWithTranslation(text, savedRange)` is called.

### `replaceSelectionWithTranslation(text, range)`

The core inline translation function. Full flow:

```
1. range.surroundContents(wrapper)       ← wraps selection in <span.lg-translating>
   └─ fallback: extractContents()        ← if selection crosses element boundaries

2. Save wrapper.innerHTML                ← original HTML snapshot for revert

3. Send TRANSLATE_SELECTION_HTML        ← background calls translator.translateHtml(html)
   └─ API receives: data: { html: ... }
   └─ API returns:  data: { html: ... }  ← translated HTML, tags preserved

4a. response.html exists:
    └─ wrapper.innerHTML = response.html ← sets translated HTML (bold/links/images intact)

4b. Fallback (no HTML response):
    └─ First text node = full translation
    └─ Other text nodes cleared

5. wrapper.className = 'lg-translated'
   wrapper.dataset.lgOriginalHtml = originalHTML
```

**Shimmer during translation**: `.lg-translating` applies a cyan pulse animation while waiting.

**After translation**: `.lg-translated` applies a dashed cyan underline (`text-decoration-style: dashed`).

**On hover**: A dark tooltip card appears above the translated span showing:
- The original text
- A **↩ Revert** button

**On revert**: `wrapper.innerHTML` is restored from `data-lg-original-html`, then the wrapper is unwrapped (children promoted in-place). The full original DOM — bold, links, emojis — is exactly restored.

---

## Inline Style Injection

On first translation, a `<style id="linguastik-inline-style">` element is injected into the host page's `<head>` with all `.lg-*` CSS rules. A shared `#lg-tooltip` div is also appended to `document.body`. Both are created only once and reused for all subsequent translations on that page.

---

## Related Modules

- [`background.ts`](./background.md) — receives `NEW_SEARCH`, `TRANSLATE_SELECTION_HTML` messages
- [`extension/src/ui/sidebar.ts`](../../packages/extension/src/ui/sidebar.ts) — `renderSidebar`, `renderLoading`, `renderError`
- [`extension/src/ui/styles.ts`](../../packages/extension/src/ui/styles.ts) — CSS injected into Shadow DOM
- [`translator.ts`](./translator.md) — `translateHtml()` for HTML-aware translation
