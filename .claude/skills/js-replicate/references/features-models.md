---
name: features-models
description: Browse, search, create models and manage model versions
---

# Models API

## Get a Model

```js
const model = await replicate.models.get("replicate", "hello-world");
// model.owner, model.name, model.description, model.latest_version, etc.
```

## List Public Models

```js
const page = await replicate.models.list();
// page.results: Model[]
```

## Search Models

```js
const results = await replicate.models.search("text to image");
// results.results: Model[]
```

## Create a Model

```js
const model = await replicate.models.create("my-org", "my-model", {
  visibility: "private",
  hardware: "gpu-a40-small",
  description: "My custom image model",
});
```

Required options: `visibility` (`"public"` | `"private"`) and `hardware` (SKU string from `replicate.hardware.list()`).

## Model Versions

```js
// List all versions
const versions = await replicate.models.versions.list("owner", "model-name");

// Get a specific version
const version = await replicate.models.versions.get(
  "owner", "model-name", "5c7d5dc6dd8bf75c1acaa8565735e7986bc5b66206b55cca93cb72c9bf15ccaa"
);
// version.id, version.openapi_schema, version.cog_version
```

## List Hardware

```js
const hardware = await replicate.hardware.list();
// [{ name: "CPU", sku: "cpu" }, { name: "Nvidia T4 GPU", sku: "gpu-t4" }, ...]
```

## Collections

```js
const collections = await replicate.collections.list();
const collection = await replicate.collections.get("text-to-image");
// collection.models: Model[]
```

## Key Points

- Model identifier format: `"owner/name"` for latest version, `"owner/name:version"` for a pinned version
- `models.search` uses the HTTP `QUERY` method internally
- All methods accept an optional `signal: AbortSignal`

<!--
Source references:
- https://github.com/replicate/replicate-javascript/blob/main/README.md
- https://github.com/replicate/replicate-javascript/blob/main/lib/models.js
- https://github.com/replicate/replicate-javascript/blob/main/lib/collections.js
- https://github.com/replicate/replicate-javascript/blob/main/lib/hardware.js
-->
