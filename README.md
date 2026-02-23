<div align="center">

<img src="assets/icon.svg" alt="Linguastik" width="72" height="72" />

# Linguastik

**Break the language barrier in your terminal and your browser — powered by [Lingo.dev](https://lingo.dev) and Google Gemini.**

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Lingo.dev](https://img.shields.io/badge/Lingo.dev-8A3FFC?style=for-the-badge&logo=google-cloud&logoColor=white)](https://lingo.dev/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://gemini.google.com/)
[![Site](https://img.shields.io/badge/Website-linguastik.netlify.app-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://linguastik.netlify.app/)
[![Demo Video](https://img.shields.io/badge/Demo%20Video-YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/watch?v=CFD54vMTH8U)

---

</div>

> 🎬 **[Watch the full demo on YouTube](https://www.youtube.com/watch?v=CFD54vMTH8U)** — CLI and browser extension walkthrough, end to end.

> 🌐 **[linguastik.netlify.app](https://linguastik.netlify.app/)** — Visit the landing page for **step-by-step installation guides and direct download links** for both the CLI and the browser extension.

Linguastik is a developer toolset that makes the web and your command line readable in any language. It ships as two separate tools that share the same translation backbone:

- **Linguastik CLI** — a command wrapper that translates terminal output in real time.
- **Linguastik Lens** — a browser extension that gives you a multi-lingual perspective on every web search.

![Architecture Overview](./assets/architecture.png)

---

## Features

### Linguastik CLI (`lingo`)

- **Real-time output translation** — wrap any terminal command (`npm`, `git`, `docker`, etc.) and read its output in your language as it streams.

 <img src="./assets/cli/cli2.png" width="400">

- **Precise mode** — run any command with `-p` / `--precise` to capture its full output and get an accurate, context-aware translation summary from lingo.dev, displayed in a clean summary box.

 <img src="./assets/cli/cli3.png" width="400">

- **Persistent settings** — configure your API key and target language once; they're saved locally and remembered between sessions.

 <img src="./assets/cli/cli1.png" width="400">

- **Smart caching** — translations are cached on disk so repeated output is instant and doesn't hit the API again.

### Linguastik Lens (Browser Extension)

- **Multi-lingual search** — every Google search triggers a parallel search in your target language, pulling in results from different regions of the world. All results are merged and displayed side by side.

- **AI-powered summaries** — the top results are summarized and translated into your native language automatically.

![SearchResult](./assets/extension/query_result.png)

- **Inline translate** — highlight any text on a webpage and click the floating translate button to replace it in-place with the translated version. Structure (bold, links, emojis) is preserved. Hover to see the original; click **↩ Revert** to restore it.

![QuickTranslate](./assets/extension/select_translate1.png)
![QuickTranslate](./assets/extension/select_translate2.png)
![QuickTranslate](./assets/extension/select_translate3.png)

- **Vision search** — upload or paste an image in the extension popup, and Gemini AI will identify what's in it and search for it across languages.

<img src="./assets/extension/image_analysis.png" width="300">

<img src="./assets/extension/image_result.png" width="300">

- **Localized popup UI** — the extension's own interface translates itself into your chosen language.

<img src="./assets/extension/extension_settings.png" width="300">

---

## Quick Start

### Prerequisites

```bash
# Clone the repository
git clone https://github.com/blueberry-adii/linguastik.git
cd linguastik

# Install dependencies
npm install

# Build the project
npm run build
```

### CLI

```bash
# Link the lingo command globally
cd packages/cli && npm link && cd ../..

# Set your Lingo.dev API key
lingo --key <your-lingo.dev-api-key>

# Set your target language (e.g. Japanese, Spanish, French)
lingo --lang ja

# Wrap any command to translate its output
lingo npm install
lingo git status

# Precise mode — full-context translation summary
lingo -p npm help
lingo --precise git log --oneline
```

### Browser Extension

1. Build the project (`npm run build` from the root).
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode** and click **Load unpacked**.
4. Select the `packages/extension/dist` folder.
5. Click the Linguastik icon and enter your **Serper**, **Lingo.dev**, and **Gemini** API keys.
6. Search on Google — the sidebar appears automatically.

---

## API Keys Required

| Key           | Where to get it                        | Used by                       |
| ------------- | -------------------------------------- | ----------------------------- |
| Lingo.dev     | [lingo.dev](https://lingo.dev)         | CLI + Extension (translation) |
| Serper        | [serper.dev](https://serper.dev)       | Extension (web search)        |
| Google Gemini | [ai.google.dev](https://ai.google.dev) | Extension (Vision AI)         |

---

## Documentation

For a detailed breakdown of every module, function, and design decision, see the **[`docs`](./docs/README.md)** directory.
