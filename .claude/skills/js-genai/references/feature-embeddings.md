---
name: feature-embeddings
description: Text and multimodal embeddings generation
---

# Embeddings

Generate vector embeddings for text or multimodal content using `ai.models.embedContent()`.

## Text Embeddings

```typescript
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({})

const response = await ai.models.embedContent({
  model: 'text-embedding-004',
  contents: 'Hello world!',
})

console.log(response) // { embeddings: [{ values: [0.1, 0.2, ...] }] }
```

## Multimodal Embeddings (Vertex AI)

```typescript
const ai = new GoogleGenAI({
  vertexai: true,
  project: 'my-project',
  location: 'us-central1',
})

const response = await ai.models.embedContent({
  model: 'gemini-embedding-2-exp-11-2025',
  contents: [{
    parts: [
      { text: 'Similar things to the following image:' },
      {
        fileData: {
          mimeType: 'image/png',
          fileUri: 'gs://bucket/image.png',
        },
      },
    ],
  }],
})
```

## Models

| Model | Type | Description |
|-------|------|-------------|
| `text-embedding-004` | Text only | Standard text embeddings |
| `gemini-embedding-2-exp-11-2025` | Multimodal | Text + image embeddings |

## Key Points

- Text embeddings work on both Gemini Developer API and Vertex AI
- Multimodal embeddings (`gemini-embedding-2-exp-11-2025`) support text and images
- Use embeddings for semantic search, clustering, and RAG applications

<!--
Source references:
- https://github.com/googleapis/js-genai/blob/main/sdk-samples/embed_content.ts
-->
