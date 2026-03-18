---
name: core-streaming
description: Streaming content generation for faster time-to-first-token
---

# Streaming

Use `generateContentStream` for faster time-to-first-token. The response is an async iterable that yields chunks as they're generated.

## Basic Streaming

```typescript
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({})

const response = await ai.models.generateContentStream({
  model: 'gemini-3-flash-preview',
  contents: 'Write a 100-word poem.',
})

for await (const chunk of response) {
  process.stdout.write(chunk.text)
}
```

## Streaming with Multimodal Output

When generating text and images together, check each chunk for `text` or `data`:

```typescript
import { GoogleGenAI, Modality } from '@google/genai'
import * as fs from 'fs'

const ai = new GoogleGenAI({})

const response = await ai.models.generateContentStream({
  model: 'gemini-2.0-flash-exp',
  contents: 'Generate a story with images for each scene.',
  config: {
    responseModalities: [Modality.IMAGE, Modality.TEXT],
  },
})

let i = 0
for await (const chunk of response) {
  if (chunk.text) {
    console.log(chunk.text)
  } else if (chunk.data) {
    fs.writeFileSync(`image_${i++}.png`, chunk.data)
  }
}
```

## Streaming with All Config Options

`generateContentStream` accepts the same parameters as `generateContent`:

```typescript
const response = await ai.models.generateContentStream({
  model: 'gemini-3-flash-preview',
  contents: 'Write a long story about a space pirate.',
  config: {
    systemInstruction: 'You are a creative writer.',
    temperature: 0.9,
    maxOutputTokens: 4096,
    tools: [{ googleSearch: {} }],
    safetySettings: [/* ... */],
  },
})

for await (const chunk of response) {
  process.stdout.write(chunk.text)
}
```

## Key Points

- Use streaming for better UX - responses start appearing immediately
- Each chunk has the same structure as a full response (`.text`, `.data`, `.functionCalls`)
- Streaming works with all features: function calling, grounding, thinking, etc.
- The `for await...of` pattern handles backpressure automatically

<!--
Source references:
- https://github.com/googleapis/js-genai/blob/main/README.md
- https://github.com/googleapis/js-genai/blob/main/codegen_instructions.md
- https://github.com/googleapis/js-genai/blob/main/sdk-samples/generate_content_streaming.ts
-->
