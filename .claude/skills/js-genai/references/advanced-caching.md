---
name: advanced-caching
description: Prompt caching for reducing costs with repeated large content prefixes
---

# Prompt Caching

Cache large content prefixes (documents, system prompts) to reduce costs when the same content is used across multiple requests.

## Create a Cache

```typescript
import { GoogleGenAI, Part } from '@google/genai'

const ai = new GoogleGenAI({
  vertexai: true,
  project: 'your-project',
  location: 'us-central1',
})

const doc1: Part = {
  fileData: {
    fileUri: 'gs://bucket/document1.pdf',
    mimeType: 'application/pdf',
  },
}

const doc2: Part = {
  fileData: {
    fileUri: 'gs://bucket/document2.pdf',
    mimeType: 'application/pdf',
  },
}

const cache = await ai.caches.create({
  model: 'gemini-2.5-flash',
  config: { contents: [doc1, doc2] },
})

console.log('Cache name:', cache.name)
```

## Use Cache in Requests

```typescript
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: 'Summarize the key findings.',
  config: {
    cachedContent: cache.name,
  },
})
```

## CRUD Operations

```typescript
// List all caches
const list = await ai.caches.list()
for await (const cached of list) {
  console.log(cached.name)
}

// Get a specific cache
const cached = await ai.caches.get({ name: cacheName })

// Update TTL
await ai.caches.update({
  name: cacheName,
  config: { ttl: '86400s' }, // 24 hours
})

// Delete
await ai.caches.delete({ name: cacheName })
```

## Key Points

- Caching reduces costs when the same large content prefix is used repeatedly
- Caches have a TTL (time-to-live) that can be configured
- Currently most useful on Vertex AI with GCS file URIs
- Cache must use the same model as the generation request

<!--
Source references:
- https://github.com/googleapis/js-genai/blob/main/README.md
- https://github.com/googleapis/js-genai/blob/main/sdk-samples/caches.ts
-->
