---
name: core-stream
description: Stream server-sent events from a Replicate model using replicate.stream()
---

# Streaming Model Output

`replicate.stream()` returns an async generator of server-sent events, ideal for LLMs and other models that produce incremental output.

## Usage

```js
const model = "meta/llama-2-70b-chat";

for await (const { event, data } of replicate.stream(model, {
  input: { prompt: "Write a haiku about coding." },
})) {
  if (event === "output") {
    process.stdout.write(data);
  }
}
```

## Collecting Full Output

```js
const output = [];

for await (const event of replicate.stream("meta/llama-2-70b-chat", {
  input: { prompt: "Explain quantum computing in 3 sentences." },
})) {
  if (event.event === "output") {
    output.push(event.data);
  }
}

console.log(output.join("").trim());
```

## Server-Sent Event Types

| event    | data format | description |
|----------|-------------|-------------|
| `output` | plain text  | New output chunk from the model |
| `logs`   | plain text  | Log output from the model |
| `error`  | JSON string | Error message if prediction fails |
| `done`   | JSON string | Emitted when prediction finishes (success, cancel, or error) |

Events with `event === "output"` have `toString()` returning the data. Other event types return empty string from `toString()`.

## Cancellation

```js
const controller = new AbortController();

setTimeout(() => controller.abort(), 10_000);

for await (const event of replicate.stream("meta/llama-2-70b-chat", {
  input: { prompt: "Tell me a long story" },
  signal: controller.signal,
})) {
  process.stdout.write(event.toString());
}
```

## Key Points

- The model must support streaming (has a `stream` URL in its prediction response)
- Throws `Error` if the model doesn't support streaming
- Works with model identifiers in `"owner/name"` or `"owner/name:version"` format
- Supports `webhook` and `webhook_events_filter` options like `run()`

<!--
Source references:
- https://github.com/replicate/replicate-javascript/blob/main/README.md
- https://github.com/replicate/replicate-javascript/blob/main/index.js
- https://github.com/replicate/replicate-javascript/blob/main/lib/stream.js
-->
