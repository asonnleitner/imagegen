---
name: feature-safety-settings
description: Safety settings for content filtering with harm categories and thresholds
---

# Safety Settings

Configure content safety filtering per harm category. Only set safety settings when explicitly needed.

## Gemini Developer API

```typescript
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai'

const ai = new GoogleGenAI({})

const response = await ai.models.generateContent({
  model: 'gemini-3-flash-preview',
  contents: 'Your prompt here',
  config: {
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      },
    ],
  },
})

// Inspect safety ratings
const ratings = response.candidates?.[0]?.safetyRatings
console.log(ratings)
```

## Vertex AI (with HarmBlockMethod)

```typescript
import { GoogleGenAI, HarmCategory, HarmBlockThreshold, HarmBlockMethod } from '@google/genai'

const ai = new GoogleGenAI({ vertexai: true, project: 'proj', location: 'us-central1' })

const response = await ai.models.generateContent({
  model: 'gemini-3-flash-preview',
  contents: 'Your prompt here',
  config: {
    safetySettings: [
      {
        method: HarmBlockMethod.SEVERITY, // Vertex AI supports method
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      },
    ],
  },
})
```

## Harm Categories

- `HARM_CATEGORY_HATE_SPEECH`
- `HARM_CATEGORY_HARASSMENT`
- `HARM_CATEGORY_SEXUALLY_EXPLICIT`
- `HARM_CATEGORY_DANGEROUS_CONTENT`

## Block Thresholds

- `BLOCK_NONE` - Don't block any content
- `BLOCK_LOW_AND_ABOVE` - Block low probability and above
- `BLOCK_MEDIUM_AND_ABOVE` - Block medium probability and above (default)
- `BLOCK_HIGH_AND_ABOVE` - Block only high probability

## Key Points

- Avoid setting safety configurations unless explicitly requested
- Vertex AI additionally supports `HarmBlockMethod.SEVERITY`
- Safety ratings are available in `response.candidates[0].safetyRatings`

<!--
Source references:
- https://github.com/googleapis/js-genai/blob/main/codegen_instructions.md
- https://github.com/googleapis/js-genai/blob/main/sdk-samples/generate_content_with_safety_settings.ts
-->
