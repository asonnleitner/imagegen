---
name: advanced-pagination-utilities
description: Paginate API results, custom fetch, automatic retries, and progress parsing
---

# Pagination & Utilities

## Pagination

All list endpoints return paginated results. Use `replicate.paginate()` to iterate through pages:

```js
for await (const page of replicate.paginate(replicate.predictions.list)) {
  for (const prediction of page) {
    console.log(prediction.id);
  }
}
```

Manual iteration:

```js
const paginator = replicate.paginate(replicate.predictions.list);
const { value: page1 } = await paginator.next();
const { value: page2 } = await paginator.next();
```

Supports cancellation:

```js
const controller = new AbortController();
for await (const page of replicate.paginate(replicate.predictions.list, {
  signal: controller.signal,
})) {
  // ...
}
```

Works with any list method: `replicate.predictions.list`, `replicate.models.list`, `replicate.trainings.list`, `replicate.deployments.list`, `replicate.files.list`.

## Custom Fetch

Inject custom behavior (logging, headers, caching) via the `fetch` option:

```js
const replicate = new Replicate({
  fetch: (url, options) => {
    console.log("API request:", url);
    return fetch(url, { ...options, cache: "no-store" });
  },
});
```

This is especially useful in Next.js App Router where `fetch` caches responses by default:

```js
replicate.fetch = (url, options) => {
  return fetch(url, { ...options, cache: "no-store" });
};
```

## Low-Level Request

Make arbitrary API calls with `replicate.request()`:

```js
const response = await replicate.request("/some/endpoint", {
  method: "POST",
  data: { key: "value" },
  params: { cursor: "abc" },  // query params
  headers: { "X-Custom": "value" },
  signal: controller.signal,
});
const json = await response.json();
```

## Automatic Retries

All requests are automatically retried with exponential backoff:
- GET requests: retried on `429` (rate limit) and `5xx` (server error)
- Non-GET requests: retried only on `429`
- Max 5 retries with 500ms base interval + jitter
- Respects `Retry-After` header

## Progress Parsing

Parse tqdm-style progress bars from prediction logs:

```js
import { parseProgressFromLogs } from "replicate";

// From a log string
const progress = parseProgressFromLogs(
  "76%|████████████████████████████         | 7568/10000 [00:33<00:10, 229.00it/s]"
);
// { percentage: 0.76, current: 7568, total: 10000 }

// Or from a prediction object (reads prediction.logs)
const progress = parseProgressFromLogs(prediction);
```

## Error Handling

API errors are thrown as `ApiError` with access to the request and response:

```js
try {
  await replicate.run("nonexistent/model", { input: {} });
} catch (error) {
  if (error.name === "ApiError") {
    console.log(error.response.status); // e.g. 404
    console.log(error.request.url);
  }
}
```

## Key Points

- `paginate()` is an async generator — use `for await...of` or `.next()`
- Automatic retries are built in — no need to implement your own retry logic
- `parseProgressFromLogs` returns `null` if no progress pattern is found
- The client works on Node.js >= 18, Bun, Deno, Cloudflare Workers, Vercel Functions, and AWS Lambda

<!--
Source references:
- https://github.com/replicate/replicate-javascript/blob/main/README.md
- https://github.com/replicate/replicate-javascript/blob/main/index.js
- https://github.com/replicate/replicate-javascript/blob/main/lib/util.js
- https://github.com/replicate/replicate-javascript/blob/main/lib/error.js
-->
