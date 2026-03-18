---
name: feature-video-generation
description: Video generation with Veo models, async operations, and downloading
---

# Video Generation

Generate videos using Veo models. Video generation is asynchronous - you submit a request and poll for completion.

## Basic Video Generation

```typescript
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({})

// Start generation (returns an operation, not the video)
let operation = await ai.models.generateVideos({
  model: 'veo-3.0-fast-generate-001',
  prompt: 'Panning wide shot of a calico kitten sleeping in the sunshine',
  config: {
    numberOfVideos: 1,
    personGeneration: 'dont_allow',
    aspectRatio: '16:9',
  },
})

// Poll for completion
while (!operation.done) {
  console.log('Waiting for video generation...')
  await new Promise(resolve => setTimeout(resolve, 10000))
  operation = await ai.operations.get({ operation })
}

// Download the videos
const videos = operation.response?.generatedVideos
if (videos?.length) {
  for (const [i, video] of videos.entries()) {
    await ai.files.download({
      file: video,
      downloadPath: `video${i}.mp4`,
    })
    console.log(`Downloaded video${i}.mp4`)
  }
}
```

## Available Models

| Model | Description |
|-------|-------------|
| `veo-3.0-generate-001` | High-fidelity video generation |
| `veo-3.1-generate-preview` | Latest, advanced video editing |
| `veo-3.0-fast-generate-001` | Faster, lower quality |
| `veo-3.1-fast-generate-preview` | Latest fast model |

## Configuration Options

```typescript
config: {
  numberOfVideos: 1,           // Number of videos to generate
  personGeneration: 'dont_allow', // Person generation control
  aspectRatio: '16:9',         // Video aspect ratio
}
```

## Key Points

- Video generation is async - always poll with `ai.operations.get()`
- Use `ai.files.download()` to save generated videos
- Veo models can be costly - check pricing before use
- Vertex AI uses `source: { prompt: '...' }` instead of top-level `prompt`

<!--
Source references:
- https://github.com/googleapis/js-genai/blob/main/codegen_instructions.md
- https://github.com/googleapis/js-genai/blob/main/sdk-samples/generate_videos.ts
-->
