---
name: advanced-webhooks
description: Receive prediction updates via webhooks and validate webhook signatures
---

# Webhooks

Webhooks push prediction status updates to your server instead of polling.

## Setting Up Webhooks

Pass `webhook` and `webhook_events_filter` when creating a prediction:

```js
await replicate.predictions.create({
  model: "owner/model",
  input: { prompt: "hello" },
  webhook: "https://my.app/webhooks/replicate",
  webhook_events_filter: ["start", "completed"], // "start" | "output" | "logs" | "completed"
});
```

Works with `replicate.run()`, `replicate.stream()`, `replicate.deployments.predictions.create()`, and `replicate.trainings.create()` as well.

## Validating Webhook Signatures

Replicate signs every webhook. Validate the signature before processing:

### With a web-standard Request object (Next.js, Hono, etc.)

```js
import { validateWebhook } from "replicate";

export async function POST(request) {
  const secret = process.env.REPLICATE_WEBHOOK_SIGNING_SECRET;

  const isValid = await validateWebhook(request.clone(), secret);

  if (!isValid) {
    return new Response("Invalid webhook", { status: 401 });
  }

  const body = await request.json();
  // process the prediction...
  return new Response("OK", { status: 200 });
}
```

### Without a Request object (Express, etc.)

```js
import { validateWebhook } from "replicate";

const isValid = await validateWebhook({
  id: req.headers["webhook-id"],
  timestamp: req.headers["webhook-timestamp"],
  signature: req.headers["webhook-signature"],
  body: req.body, // string, ArrayBuffer, or ReadableStream
  secret: process.env.REPLICATE_WEBHOOK_SIGNING_SECRET,
});
```

## Getting the Webhook Secret

```js
const { key } = await replicate.webhooks.default.secret.get();
```

## Key Points

- Always clone the `Request` before validating (validation consumes the body)
- The `validateWebhook` function uses the Web Crypto API (`globalThis.crypto`)
- On Node.js <= 18 without global crypto, pass `require("node:crypto").webcrypto` as the third argument
- Webhook events: `start` (prediction created), `output` (new output), `logs` (new logs), `completed` (terminal state)

<!--
Source references:
- https://github.com/replicate/replicate-javascript/blob/main/README.md
- https://github.com/replicate/replicate-javascript/blob/main/lib/util.js
- https://github.com/replicate/replicate-javascript/blob/main/lib/webhooks.js
-->
