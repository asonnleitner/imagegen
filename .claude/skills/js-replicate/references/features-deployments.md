---
name: features-deployments
description: Manage custom deployments with dedicated endpoints and auto-scaling
---

# Deployments

Deployments give you a private, fixed API endpoint for a model with configurable hardware, scaling, and versioning.

## Create a Deployment

```js
const deployment = await replicate.deployments.create({
  name: "my-app-image-gen",
  model: "stability-ai/sdxl",
  version: "da77bc59ee60423279fd632efb4795ab731d9e3ca9705ef3341091fb989b7eaf",
  hardware: "gpu-a40-large",
  min_instances: 1,
  max_instances: 5,
});
```

## Get a Deployment

```js
const deployment = await replicate.deployments.get("acme", "my-app-image-gen");
// deployment.current_release.configuration.hardware
// deployment.current_release.version
```

## Update a Deployment

Change the version, hardware, or scaling:

```js
const updated = await replicate.deployments.update("acme", "my-app-image-gen", {
  version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
  min_instances: 2,
  max_instances: 10,
});
```

## Delete a Deployment

```js
const deleted = await replicate.deployments.delete("acme", "my-app-image-gen");
// returns true on success
```

## List Deployments

```js
const page = await replicate.deployments.list();
// page.results: Deployment[]
```

## Run Predictions on a Deployment

```js
const prediction = await replicate.deployments.predictions.create(
  "acme",
  "my-app-image-gen",
  {
    input: { prompt: "a beautiful landscape" },
    webhook: "https://my.app/webhooks/replicate",
    webhook_events_filter: ["completed"],
  }
);

// Then wait for it or poll
const result = await replicate.wait(prediction);
```

The `wait` option also works for deployment predictions:

```js
const prediction = await replicate.deployments.predictions.create(
  "acme", "my-app-image-gen",
  { input: { prompt: "hello" }, wait: true }
);
```

## Key Points

- Deployments provide a stable endpoint — useful for production apps
- `min_instances` controls cold start behavior (0 = scale to zero)
- Use `replicate.wait()` or `replicate.predictions.cancel()` with deployment predictions
- All methods accept an optional `signal: AbortSignal`

<!--
Source references:
- https://github.com/replicate/replicate-javascript/blob/main/README.md
- https://github.com/replicate/replicate-javascript/blob/main/lib/deployments.js
-->
