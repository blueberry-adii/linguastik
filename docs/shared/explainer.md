# `shared/src/explainer.ts`

> **Role**: Pattern-based error analysis engine. Matches raw terminal error output against a structured JSON database to produce localized, human-readable explanations with root causes and actionable fixes.

**Source**: [`shared/src/explainer.ts`](../../shared/src/explainer.ts)  
**Used by**: [`cli/src/index.ts`](../cli/index.md) (error pattern matching, available regardless of mode)

---

## Overview

When a developer runs a command with `lingo --precise <cmd>`, and that command fails, the full `stderr` output is captured and passed to `Explainer.explain()`. The explainer scans it against a database of regex patterns. When a match is found, it returns a structured report including:

- **Tool**: Which tool caused the error (e.g., `git`, `npm`, `docker`).
- **Title**: A short problem title.
- **Problem**: A localized, human-friendly description.
- **Causes**: An array of common root causes.
- **Fixes**: Actionable steps to resolve the issue.
- **Learn More**: Optional URL to external documentation.

---

## Type Definitions

### `Severity`

```typescript
type Severity = "error" | "warning" | "info";
```

Indicates how critical a matched pattern is.

---

### `Explanation` (Public Interface)

The shape returned from `Explainer.explain()`:

| Field          | Type       | Description                                                             |
| -------------- | ---------- | ----------------------------------------------------------------------- |
| `id`           | `string`   | Unique pattern ID from the database (e.g., `"git-auth-failure"`)        |
| `tool`         | `string`   | Tool name (e.g., `"git"`, `"npm"`)                                      |
| `severity`     | `Severity` | Severity level of the error                                             |
| `title`        | `string`   | A short, human-readable error title                                     |
| `problem`      | `string`   | Localized description of the problem, with captured group substitutions |
| `causes`       | `string[]` | List of likely reasons the error occurred                               |
| `fixes`        | `string[]` | List of suggested commands/actions to resolve the problem               |
| `learnMoreUrl` | `string?`  | Optional documentation URL                                              |

---

### Pattern Database (`errors.json`)

The patterns file is a JSON object matching the `PatternsDB` structure:

```json
{
  "version": "1.0.0",
  "lastUpdated": "2024-01-01",
  "patterns": [
    {
      "id": "npm-enoent",
      "tool": "npm",
      "regex": "Error: Cannot find module '(.+)'",
      "severity": "error",
      "explanation": {
        "title": "Module '{1}' Not Found",
        "en": "npm could not find the module '{1}'.",
        "es": "npm no pudo encontrar el módulo '{1}'.",
        "causes": ["Module is not installed", "Typo in import path"],
        "fixes": ["Run `npm install {1}`", "Check the import path in your code"]
      },
      "learnMoreUrl": "https://docs.npmjs.com/..."
    }
  ]
}
```

> **Note**: `{1}`, `{2}`, etc. are placeholders that get replaced with regex capture groups at match time.

---

## Class: `Explainer`

### `constructor(targetLang?: string)`

| Parameter    | Type     | Default | Description                        |
| ------------ | -------- | ------- | ---------------------------------- |
| `targetLang` | `string` | `'en'`  | Language code for localized output |

**Behavior**: Sets `this.targetLang` and calls `loadPatterns()` to read `patterns/errors.json` from the filesystem.

---

### `explain(text: string): Explanation | null`

The core method. Scans a block of error text against all registered patterns.

| Parameter | Type     | Description                                                    |
| --------- | -------- | -------------------------------------------------------------- |
| `text`    | `string` | The raw stderr output (or error message) from a failed command |

**Returns**: An `Explanation` object on the first match, or `null` if no patterns match.

**Algorithm**:

```
for each pattern in this.patterns:
  regex = new RegExp(pattern.regex, 'is')    // case-insensitive, dotAll
  match = text.match(regex)
  if match:
    1. Get localized problem text (e.g., pattern.explanation['ja'] || pattern.explanation['en'])
    2. Substitute capture groups into {1}, {2} placeholders in title and problem
    3. Return assembled Explanation object
return null
```

```typescript
// Example usage in cli/index.ts
const explanation = explainer.explain(capturedStderr);
if (explanation) {
  console.log(
    format.box(
      `[${explanation.severity.toUpperCase()}] ${explanation.title}`,
      `Problem: ${explanation.problem}\nFixes: ${explanation.fixes.join(", ")}`,
      "red"
    )
  );
}
```

---

### `setLanguage(lang: string)`

Updates the target language for localized output. Call this if the user changes their config while the explainer is already instantiated.

```typescript
explainer.setLanguage("fr"); // future explanations in French
```

---

### `getPatterns(): ErrorPattern[]`

Returns all loaded patterns. Useful for debugging or displaying a list of supported tools.

### `getPatternsByTool(tool: string): ErrorPattern[]`

Filters patterns to only those matching a specific tool name.

### `getPatternsBySeverity(severity: Severity): ErrorPattern[]`

Filters patterns by severity level.

---

## Localization Strategy

The `getLocalizedText(explanation)` private method implements a simple fallback:

```typescript
return explanation[this.targetLang] || explanation.en;
```

If a translation for the target language doesn't exist in the pattern, it falls back to English — ensuring the user always sees something useful.

---

## Singleton Export

```typescript
export const explainer = new Explainer();
```

---

## Related Modules

- [`cli/index.ts`](../cli/index.md) — uses `explainer.explain()` for error pattern matching
- [`shared/src/patterns/errors.json`](../../shared/src/patterns) — the pattern database loaded at startup
