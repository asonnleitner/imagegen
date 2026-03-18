---
name: js-replicate
description: Replicate JavaScript/Node.js client SDK for running AI models, streaming outputs, managing deployments, and fine-tuning
metadata:
  author: Andreas Sonnleitner
  version: "2026.3.18"
  source: Generated from https://github.com/replicate/replicate-javascript, scripts located at https://github.com/asonnleitner/skills
---

> The skill is based on the `replicate` npm package (replicate-javascript), generated at 2026-03-18.

The Replicate JavaScript client lets you run AI models from Node.js (>=18), Bun, Deno, and serverless platforms (Cloudflare Workers, Vercel Functions, AWS Lambda). It wraps Replicate's HTTP API for predictions, streaming, model management, deployments, trainings, and file uploads.

## Core References

| Topic | Description | Reference |
|-------|-------------|-----------|
| Run Models | `replicate.run()` — run a model and await output, with block/poll modes | [core-run](references/core-run.md) |
| Stream Models | `replicate.stream()` — stream server-sent events from a model | [core-stream](references/core-stream.md) |
| Predictions | Create, get, cancel, list predictions with low-level control | [core-predictions](references/core-predictions.md) |

## Features

### Models & Collections

| Topic | Description | Reference |
|-------|-------------|-----------|
| Models API | Get, list, create, search models and model versions | [features-models](references/features-models.md) |

### Deployments

| Topic | Description | Reference |
|-------|-------------|-----------|
| Deployments | Create, update, delete, and run predictions on custom deployments | [features-deployments](references/features-deployments.md) |

### Training

| Topic | Description | Reference |
|-------|-------------|-----------|
| Trainings | Fine-tune models using the training API | [features-trainings](references/features-trainings.md) |

### Files

| Topic | Description | Reference |
|-------|-------------|-----------|
| Files & FileOutput | Upload files, handle FileOutput streams, file encoding strategies | [features-files](references/features-files.md) |

## Advanced

| Topic | Description | Reference |
|-------|-------------|-----------|
| Webhooks | Receive prediction updates via webhooks and validate signatures | [advanced-webhooks](references/advanced-webhooks.md) |
| Pagination & Utilities | Paginate results, automatic retries, progress parsing | [advanced-pagination-utilities](references/advanced-pagination-utilities.md) |
