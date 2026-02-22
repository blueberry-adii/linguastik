# Linguastik CLI — `lingo`

> Wrap any terminal command and read its output in your language, in real time.

```bash
npm install -g @linguastik/cli   # or npm link from source
```

---

## Usage

```bash
lingo [options] <command> [args...]
```

### Options

| Flag | Alias | Description |
|---|---|---|
| `--key <key>` | `-k` | Set your Lingo.dev API key (saved persistently) |
| `--lang <code>` | `-l` | Set target language (e.g. `ja`, `es`, `fr`, `de`) |
| `--precise` | `-p` | Capture full output then translate in one context-aware request |

### Examples

```bash
# Set up once
lingo --key <your-lingo-api-key>
lingo --lang ja

# Wrap any command — output is translated line by line
lingo git status
lingo npm install
lingo docker compose up

# Precise mode — full output → single accurate translation
lingo -p npm help
lingo -p git log --oneline
```

---

## How it works

| Mode | Behaviour |
|---|---|
| **Default** | Spawns the command, streams each output line through Lingo.dev, prints translation immediately |
| **Precise (`-p`)** | Runs command with raw passthrough, captures full output, sends it as one request for better accuracy |

Translations are **cached on disk** — repeated identical lines are instant and never re-hit the API.

---

## Config

Settings are saved to `~/.linguastik/config.json`.

```bash
lingo --key sk-...        # Save API key
lingo --lang fr           # Save target language
lingo git status          # Use saved config automatically
```

---

## Requirements

- Node.js ≥ 18
- A [Lingo.dev](https://lingo.dev) API key

---

## Build from source

```bash
# From the monorepo root
npm install && npm run build

# Link globally
cd packages/cli && npm link
```
