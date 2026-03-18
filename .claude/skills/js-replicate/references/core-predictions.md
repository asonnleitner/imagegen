---
name: core-predictions
description: Low-level prediction management — create, get, cancel, list, and wait
---

# Predictions API

The predictions API gives you full control over the prediction lifecycle, unlike `replicate.run()` which returns only the output.

## Create a Prediction

Using a model name (official models):

```js
const prediction = await replicate.predictions.create({
  model: "black-forest-labs/flux-schnell",
  input: { prompt: "a cat astronaut" },
});
```

Using a specific version:

```js
const prediction = await replicate.predictions.create({
  version: "27b93a2413e7f36cd83da926f3656280b2931564ff050bf9575f1fdf9bcd7478",
  input: { prompt: "a cat astronaut" },
});
```

Either `model` or `version` must be specified — not both.

## Synchronous Wait

Use the `wait` option to hold the connection open until the prediction completes:

```js
const prediction = await replicate.predictions.create({
  model: "owner/model",
  input: { prompt: "hello" },
  wait: true,       // hold connection open (default timeout ~60s)
  // wait: 30,      // wait up to 30 seconds
});
```

## Get a Prediction

```js
const prediction = await replicate.predictions.get("ufawqhfynnddngldkgtslldrkq");
// prediction.status: "starting" | "processing" | "succeeded" | "failed" | "canceled"
```

## Cancel a Prediction

```js
const prediction = await replicate.predictions.cancel("ufawqhfynnddngldkgtslldrkq");
```

## List Predictions

```js
const page = await replicate.predictions.list();
// page.results: Prediction[]
// page.next: string | null (cursor URL)
```

## Wait for Completion

`replicate.wait()` polls until a prediction reaches a terminal status:

```js
let prediction = await replicate.predictions.create({
  model: "owner/model",
  input: { prompt: "hello" },
});

prediction = await replicate.wait(prediction, { interval: 1000 });
console.log(prediction.output);
```

The optional `stop` callback can cancel polling early:

```js
prediction = await replicate.wait(prediction, {}, async (updated) => {
  console.log(updated.status);
  return false; // return true to stop polling
});
```

## Prediction Object Shape

```ts
interface Prediction {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  model: string;
  version: string;
  input: object;
  output?: any;
  error?: unknown;
  logs?: string;
  metrics?: { predict_time?: number; total_time?: number };
  created_at: string;
  started_at?: string;
  completed_at?: string;
  urls: { get: string; cancel: string; stream?: string };
}
```

## Key Points

- `predictions.create` is the foundation — `run()` and `stream()` use it internally
- `wait: true` uses the `Prefer: wait` HTTP header for server-side long polling
- All methods accept an optional `signal: AbortSignal` for cancellation
- File/Blob/Buffer inputs are automatically uploaded before creating the prediction

<!--
Source references:
- https://github.com/replicate/replicate-javascript/blob/main/README.md
- https://github.com/replicate/replicate-javascript/blob/main/lib/predictions.js
- https://github.com/replicate/replicate-javascript/blob/main/index.d.ts
-->
