# `extension/src/aggregator.ts`

> **Role**: Merges search results from multiple regional queries into a balanced, unified list for display in the Linguastik sidebar.

**Source**: [`extension/src/aggregator.ts`](../../packages/extension/src/aggregator.ts)  
**Called by**: [`extension/src/background.ts`](./background.md)

---

## Overview

When the background script executes a search, it queries multiple regions in parallel (e.g., English/US and Spanish/ES). Each region returns a separate list of results. `aggregateResults` combines these lists into a single, interleaved result set, ensuring no single region dominates the top of the list.

---

## Interface: `AggregatedResults`

| Field      | Type             | Description                                   |
| ---------- | ---------------- | --------------------------------------------- |
| `en`       | `SearchResult[]` | Results from the English (US) region          |
| `ja`       | `SearchResult[]` | Results from the Japanese region              |
| `de`       | `SearchResult[]` | Results from the German region                |
| `combined` | `SearchResult[]` | The interleaved, balanced list of all results |

> **Note**: The `en`, `ja`, `de` fields are kept for potential future use in region-specific filtering in the sidebar UI.

---

## Function: `aggregateResults(results)`

| Parameter | Type                             | Description                                                                 |
| --------- | -------------------------------- | --------------------------------------------------------------------------- |
| `results` | `Record<string, SearchResult[]>` | Map of language code → results array (e.g., `{ 'en': [...], 'es': [...] }`) |

**Returns**: An `AggregatedResults` object with per-region slices and a `combined` array.

---

### Round-Robin Merge Algorithm

The `combined` list is built using a **round-robin interleaving** strategy. This is important for result equity — rather than showing all English results first, then all Spanish results, it alternates:

```
results = {
  'en': [A1, A2, A3],
  'es': [B1, B2, B3],
}

combined = [A1, B1, A2, B2, A3, B3]
```

**Implementation**:

```typescript
const values = Object.values(results);
const maxLen = Math.max(...values.map((v) => v.length));

for (let i = 0; i < maxLen; i++) {
  for (const list of values) {
    if (i < list.length) {
      combined.push(list[i]);
    }
  }
}
```

This loop runs once per "row" (rank position), collecting the i-th result from each region. Lists of unequal length are handled safely — shorter lists simply stop contributing earlier.

---

### Why This Matters

If an English speaker searches for a Japanese concept (or vice versa), the top-ranked English result for a translated query may not be more useful than the top Japanese result. By interleaving, Linguastik ensures that culturally and linguistically diverse perspectives appear together at the top of the results.

---

## Related Modules

- [`background.ts`](./background.md) — calls `aggregateResults` with multi-region search outputs
- [`searcher.ts`](./searcher.md) — produces the `SearchResult[]` arrays that feed into `aggregateResults`
