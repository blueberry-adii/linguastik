# Linguastik Documentation

Welcome to the complete documentation for **Linguastik** — a developer toolset for real-time translation across the terminal and the web, powered by [Lingo.dev](https://lingo.dev) and Google Gemini.

---

## Architecture Overview

```
linguastik/
├── shared/        - Core logic: translation, config, caching, error analysis
├── packages/
│   ├── cli/       - Terminal command wrapper (lingo.dev)
│   └── extension/ - Linguastik Lens browser extension
```

The `shared` package is the backbone — it defines the translation engine, configuration system, and error explainer used by the CLI. The extension has its own browser compatible translator but follows the same design patterns.

---

## Documentation Index

### Shared Package

Core utilities consumed by the CLI (and mirrored in the extension):

| File                                    | Description                                                           |
| --------------------------------------- | --------------------------------------------------------------------- |
| [cache.md](./shared/cache.md)           | Two-tier (memory + disk) translation cache to prevent API redundancy  |
| [config.md](./shared/config.md)         | Persistent user settings management (`~/.lingo-dev/config.json`)      |
| [explainer.md](./shared/explainer.md)   | Regex-pattern error analysis engine with localized fixes              |
| [translator.md](./shared/translator.md) | Lingo.dev SDK wrapper with caching, validation, and graceful fallback |
| [utils.md](./shared/utils.md)           | `pLimit()` — async concurrency limiter for translation pipeline       |

---

### CLI Package (`lingo-dev`)

The terminal command wrapper:

| File                               | Description                                                             |
| ---------------------------------- | ----------------------------------------------------------------------- |
| [index.md](./cli/index.md)         | CLI entry point — argument parsing, `--precise` mode, exit code propagation    |
| [wrapper.md](./cli/wrapper.md)     | `execWithTranslation()` — real-time stream interception and translation |
| [formatter.md](./cli/formatter.md) | Console output utilities: colors, boxes, spinners                       |

---

### Extension Package (Linguastik Lens)

The browser extension:

| File                                       | Description                                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------------------------- |
| [background.md](./extension/background.md) | Service worker orchestrator — multi-lingual search pipeline, Gemini Vision, message routing |
| [content.md](./extension/content.md)       | Content script — sidebar injection (Shadow DOM), URL polling, selection translate           |
| [popup.md](./extension/popup.md)           | Popup UI — settings, Vision AI upload, UI localization                                      |
| [translator.md](./extension/translator.md) | Browser-native Lingo.dev REST client with language detection                                |
| [searcher.md](./extension/searcher.md)     | Serper API wrapper for region-specific web searches                                         |
| [aggregator.md](./extension/aggregator.md) | Round-robin merger for multi-region search results                                          |

---

## Quick Start

```bash
# Clone this git repository
git clone https://github.com/blueberry-adii/linguastik.git

# Open project in your IDE
cd linguastik
code .

# Install dependencies
npm install

# Build the project
npm run build
```

### CLI

```bash
# Set CLI command globally
cd packages/cli
npm link
cd ../..

# Set your API key
lingo --key <your-lingo.dev-key>

# Set target language
lingo --lang ja

# Wrap any command
lingo npm test

# Precise mode — full-context translation summary
lingo -p npm help
```

### Extension

1. Load the `packages/extension/dist` folder as an unpacked extension in Chrome.
2. Click the Linguastik icon and enter your **Serper**, **Lingo.dev**, and **Gemini** API keys.
3. Set your **Foreign Language** (what language results you want to see) and **User Language** (your native language for output).
4. Search on Google — the sidebar will appear automatically.

---

## Key Concepts

| Concept                     | Description                                                                     |
| --------------------------- | ------------------------------------------------------------------------------- |
| **Translation Cache**       | Prevents duplicate API calls; persists across sessions in `~/.lingo-dev/cache/` |
| **pLimit Concurrency**      | Caps concurrent Lingo.dev API calls at 5 to avoid rate limits                   |
| **Shadow DOM Isolation**    | Extension sidebar CSS is isolated from host website styles                      |
| **Round-Robin Aggregation** | Multi-region results are interleaved for balanced global perspectives           |
| **Error Patterns DB**       | JSON database of regex patterns provides localized CLI error explanations       |
