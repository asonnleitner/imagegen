---
name: features-trainings
description: Fine-tune models using the Replicate training API
---

# Trainings

Fine-tune supported models (language models, image models) to create custom versions.

## Create a Training

```js
const training = await replicate.trainings.create(
  "owner",         // model owner
  "model-name",    // model name
  "version-id",    // base model version to fine-tune
  {
    destination: "my-org/my-fine-tuned-model", // where the trained version is saved
    input: {
      train_data: "https://example.com/training-data.jsonl",
      // model-specific training parameters
    },
    webhook: "https://my.app/webhooks/training",
    webhook_events_filter: ["completed"],
  }
);
```

## Get Training Status

```js
const training = await replicate.trainings.get("zz4ibbonubfz7carwiefibzgga");
// training.status: "starting" | "processing" | "succeeded" | "failed" | "canceled"
// training.output?.version — the new model version ID after training succeeds
```

## Cancel a Training

```js
const training = await replicate.trainings.cancel("zz4ibbonubfz7carwiefibzgga");
```

## List All Trainings

```js
const page = await replicate.trainings.list();
// page.results: Training[]
```

## Training Object Shape

```ts
interface Training {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  model: string;
  version: string;
  input: object;
  output?: { version?: string; weights?: string };
  error?: unknown;
  logs?: string;
  metrics?: { predict_time?: number; total_time?: number };
  created_at: string;
  started_at?: string;
  completed_at?: string;
}
```

## Key Points

- Not all models support training — you'll get a `400 Bad Request` if the model doesn't support it
- The `destination` field must be in `"username/model_name"` format
- After training succeeds, `training.output.version` contains the new version ID you can use for predictions
- All methods accept an optional `signal: AbortSignal`

<!--
Source references:
- https://github.com/replicate/replicate-javascript/blob/main/README.md
- https://github.com/replicate/replicate-javascript/blob/main/lib/trainings.js
- https://github.com/replicate/replicate-javascript/blob/main/index.d.ts
-->
