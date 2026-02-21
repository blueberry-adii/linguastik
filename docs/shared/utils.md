# `shared/src/utils.ts`

> **Role**: General-purpose async concurrency utilities shared across the Linguastik project.

**Source**: [`shared/src/utils.ts`](../../shared/src/utils.ts)  
**Used by**: [`cli/src/wrapper.ts`](../cli/wrapper.md)

---

## Overview

This file provides a lightweight, dependency-free implementation of the popular [`p-limit`](https://github.com/sindresorhus/p-limit) pattern — a tool for limiting the number of concurrently executing Promises. It is a critical part of the CLI's translation pipeline.

---

## Function: `pLimit(concurrency: number)`

Creates and returns a rate-limiting wrapper function for async tasks.

| Parameter     | Type     | Description                                                 |
| ------------- | -------- | ----------------------------------------------------------- |
| `concurrency` | `number` | Maximum number of async tasks allowed to run simultaneously |

**Returns**: A function `enqueue<T>(fn: () => Promise<T>): Promise<T>` that schedules tasks according to the concurrency limit.

---

### Why This Is Needed

When a command outputs many lines quickly (e.g., `npm ci` downloading packages), each line is queued for translation. Without limits, all these `translator.translate()` calls would fire simultaneously, potentially overloading the Lingo.dev API and exceeding rate limits. `pLimit(5)` ensures at most 5 translation calls are in-flight at any given time.

---

### Internal State

```typescript
const queue: (() => void)[] = []; // Pending tasks waiting to run
let activeCount = 0; // Currently executing tasks
```

---

### Internal Functions

#### `next()`

Called when a task finishes. Decrements `activeCount` and, if the queue is not empty, dequeues and starts the next task.

#### `run<T>(fn: () => Promise<T>): Promise<T>`

Increments `activeCount`, awaits the task, calls `next()`, and returns the result.

#### `enqueue<T>(fn: () => Promise<T>): Promise<T>` _(returned)_

The public interface. Immediately runs the task if `activeCount < concurrency`; otherwise wraps it in a Promise and pushes it to the queue to be started later.

---

### Execution Flow Diagram

```
Task arrives via enqueue(fn)
│
├─ activeCount < concurrency?
│   YES → run(fn) immediately
│       activeCount++
│       await fn()
│       activeCount--
│       next() → dequeue next task if any
│
│   NO  → push to queue
│          (waits until next() is called by a completing task)
│
└─ Promise resolved/rejected when fn() settles
```

---

### Usage Example (from `wrapper.ts`)

```typescript
import { pLimit } from "@linguastik/shared";

const limit = pLimit(5); // max 5 concurrent translations

// For each line of output:
const translated = await limit(() => translator.translate(line));
```

Wrapping `translator.translate(line)` with `limit()` ensures the entire batch of concurrent translations is capped at 5, regardless of how fast lines are produced.

---

## Related Modules

- [`cli/wrapper.ts`](../cli/wrapper.md) — the primary consumer of `pLimit`
- [`shared/src/index.ts`](../../shared/src/index.ts) — re-exports `pLimit` from the shared package
