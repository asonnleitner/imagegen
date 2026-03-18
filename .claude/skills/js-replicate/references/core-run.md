---
name: core-run
description: Run a Replicate model and await its output using replicate.run()
---

# Running Models

`replicate.run()` is the primary way to run a model. It returns the prediction output directly (not the full prediction object).

## Setup

```js
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN, // defaults to this env var
});
```

## Basic Usage

Reference a model as `"owner/name"` (uses latest version) or `"owner/name:version"` (pins a specific version):

```js
const output = await replicate.run("stability-ai/sdxl", {
  input: { prompt: "a cat in a spacesuit" },
});
```

For image models, output is typically an array of `FileOutput` objects:

```js
const [image] = await replicate.run("black-forest-labs/flux-schnell", {
  input: { prompt: "astronaut riding a rocket" },
});

// FileOutput is a ReadableStream
console.log(image.url());    // URL object
const blob = await image.blob(); // Blob
```

## File Inputs

Pass a local file as a `Buffer` — it's automatically uploaded:

```js
import fs from "node:fs/promises";

const [output] = await replicate.run("nightmareai/real-esrgan:42fed1c4...", {
  input: { image: await fs.readFile("photo.png") },
});
```

You can also pass a publicly accessible URL string as input.

## Block vs Poll Mode

By default, `run()` uses `"block"` mode which holds the HTTP connection open for low latency:

```js
// Block mode (default) — holds connection open, fastest for short-running models
const output = await replicate.run("owner/model", {
  input: { prompt: "hello" },
  wait: { mode: "block", timeout: 60 },
});

// Poll mode — periodically fetches prediction status
const output = await replicate.run("owner/model", {
  input: { prompt: "hello" },
  wait: { mode: "poll", interval: 1000 },
});
```

## Progress Callback

Track prediction status with a third argument callback:

```js
const output = await replicate.run(
  "stability-ai/sdxl",
  { input: { prompt: "a painting" } },
  (prediction) => {
    const lastLog = prediction.logs?.split("\n").pop();
    console.log({ id: prediction.id, log: lastLog });
  }
);
```

## Cancellation

Use `AbortSignal` to cancel a running prediction:

```js
const controller = new AbortController();

setTimeout(() => controller.abort(), 5000);

const output = await replicate.run("owner/model", {
  input: { prompt: "hello" },
  signal: controller.signal,
});
```

## Key Points

- Returns the model output directly, not the prediction object
- File outputs are `FileOutput` (ReadableStream) by default — use `useFileOutput: false` in constructor to get raw URLs
- `"block"` mode is optimized for low latency; falls back to polling if the server doesn't respond within `timeout`
- File/Blob/Buffer inputs are auto-uploaded to Replicate (max 100MiB)

<!--
Source references:
- https://github.com/replicate/replicate-javascript/blob/main/README.md
- https://github.com/replicate/replicate-javascript/blob/main/index.js
-->
