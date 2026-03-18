---
name: feature-image-generation
description: Image generation with Gemini native models and Imagen, plus image editing
---

# Image Generation

## Gemini Native Image Generation (Nano Banana)

Generate images directly with Gemini models that output interleaved text and images.

### Fast Generation (Gemini 2.5 Flash Image)

```typescript
import { GoogleGenAI } from '@google/genai'
import * as fs from 'fs'

const ai = new GoogleGenAI({})

const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash-image',
  contents: 'Create a picture of a futuristic city at sunset.',
})

for (const part of response.candidates[0].content.parts) {
  if (part.text) {
    console.log(part.text)
  } else if (part.inlineData) {
    fs.writeFileSync('output.png', Buffer.from(part.inlineData.data, 'base64'))
  }
}
```

### High-Quality Generation (Gemini 3 Pro Image)

Supports aspect ratio, resolution, and Google Search grounding:

```typescript
const response = await ai.models.generateContent({
  model: 'gemini-3-pro-image-preview',
  contents: 'Visualize a weather forecast chart for San Francisco.',
  config: {
    imageConfig: {
      aspectRatio: '16:9', // 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9
      imageSize: '2K',     // 1K, 2K, 4K
    },
    tools: [{ googleSearch: {} }], // For real-time data
  },
})
```

## Image Editing with Chat

Use chat mode for iterative image editing:

```typescript
const imageBase64 = fs.readFileSync('image.png').toString('base64')

const chat = ai.chats.create({ model: 'gemini-2.5-flash-image' })

const response = await chat.sendMessage({
  content: [
    { inlineData: { mimeType: 'image/png', data: imageBase64 } },
    'Change the background to a beach.',
  ],
})

for (const part of response.candidates[0].content.parts) {
  if (part.inlineData) {
    fs.writeFileSync('edited.png', Buffer.from(part.inlineData.data, 'base64'))
  }
}
```

## Imagen (Dedicated Image Model)

For standalone image generation using Imagen:

```typescript
const response = await ai.models.generateImages({
  model: 'imagen-4.0-generate-001',
  prompt: 'Robot holding a red skateboard',
  config: {
    numberOfImages: 1,
    includeRaiReason: true,
  },
})

const imageBytes = response?.generatedImages?.[0]?.image?.imageBytes
if (imageBytes) {
  fs.writeFileSync('imagen_output.png', Buffer.from(imageBytes, 'base64'))
}
```

## Key Points

- Use `gemini-2.5-flash-image` for fast image generation and editing
- Use `gemini-3-pro-image-preview` for high-quality images with resolution/aspect control
- Chat mode is recommended for image editing workflows
- Imagen (`imagen-4.0-generate-001`) is a dedicated image model with different API
- Gemini native image models output mixed text+image parts

<!--
Source references:
- https://github.com/googleapis/js-genai/blob/main/codegen_instructions.md
- https://github.com/googleapis/js-genai/blob/main/sdk-samples/generate_image.ts
-->
