---
name: core-setup
description: Initialization and configuration of the Google Gen AI SDK client
---

# Setup & Initialization

The `@google/genai` package is the unified SDK for Gemini API and Vertex AI. Always use this package - the legacy `@google/generative-ai` and `@google-cloud/vertexai` are deprecated.

## Installation

```bash
npm install @google/genai
```

## Gemini Developer API (AI Studio)

```typescript
import { GoogleGenAI } from '@google/genai'

// Explicit API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// Or auto-detect from GEMINI_API_KEY / GOOGLE_API_KEY env vars (Node.js only)
const ai = new GoogleGenAI({})
```

## Vertex AI

```typescript
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({
  vertexai: true,
  project: 'your-project-id',
  location: 'us-central1',
})
```

Environment variables for Vertex AI:

```bash
export GOOGLE_GENAI_USE_VERTEXAI=true
export GOOGLE_CLOUD_PROJECT='your-project-id'
export GOOGLE_CLOUD_LOCATION='us-central1'
```

## API Version

The SDK uses beta endpoints by default. Set `apiVersion` to use stable or alpha:

```typescript
// Stable API
const ai = new GoogleGenAI({ apiKey: 'KEY', apiVersion: 'v1' })

// Alpha API (for experimental features like Live API)
const ai = new GoogleGenAI({ apiKey: 'KEY', apiVersion: 'v1alpha' })
```

## HTTP Options

```typescript
const ai = new GoogleGenAI({
  apiKey: 'KEY',
  httpOptions: {
    timeout: 30000,
    retryOptions: { attempts: 3 },
  },
})
```

## Recommended Models

| Use Case | Model |
|----------|-------|
| General text & multimodal | `gemini-3-flash-preview` |
| Complex reasoning & coding | `gemini-3-pro-preview` |
| Low latency / high volume | `gemini-2.5-flash-lite` |
| Fast image generation | `gemini-2.5-flash-image` |
| High-quality image generation | `gemini-3-pro-image-preview` |
| Video generation | `veo-3.0-generate-001`, `veo-3.1-generate-preview` |
| Fast video generation | `veo-3.0-fast-generate-001` |

Deprecated models (do not use): `gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-pro`.

## SDK Submodules

All features are accessed through the `GoogleGenAI` instance:

- `ai.models` - Content generation, images, videos, embeddings, token counting
- `ai.chats` - Multi-turn conversation sessions
- `ai.files` - File upload/download
- `ai.caches` - Prompt caching (cost reduction)
- `ai.live` - Real-time WebSocket sessions
- `ai.interactions` - Stateful interactions (Beta)
- `ai.operations` - Long-running operation tracking
- `ai.batches` - Batch processing
- `ai.tunings` - Model fine-tuning (Vertex AI)

## Error Handling

```typescript
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({})

try {
  const response = await ai.models.generateContent({
    model: 'non-existent-model',
    contents: 'Hello',
  })
} catch (e) {
  // ApiError extends Error
  console.error(e.name)    // Error name
  console.error(e.message) // Error description
  console.error(e.status)  // HTTP status code
}
```

## Key Points

- Always import from `@google/genai`, never from deprecated packages
- Use `GoogleGenAI` class (not `GoogleGenerativeAI` or `GenerativeModel`)
- Use `ai.models.generateContent()` (not `model.generateContent()`)
- Use `ApiError` for error handling (not `GoogleGenAIError`)
- API key security: never expose keys in client-side code in production

<!--
Source references:
- https://github.com/googleapis/js-genai/blob/main/README.md
- https://github.com/googleapis/js-genai/blob/main/codegen_instructions.md
-->
