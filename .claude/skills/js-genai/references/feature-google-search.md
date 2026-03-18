---
name: feature-google-search
description: Grounding with Google Search for real-time web data
---

# Google Search Grounding

Connect Gemini to real-time web data using Google Search as a tool.

## Usage

```typescript
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({})

const response = await ai.models.generateContent({
  model: 'gemini-3-flash-preview',
  contents: 'What was the score of the latest Champions League final?',
  config: {
    tools: [{ googleSearch: {} }],
  },
})

console.log(response.text)
```

## Inspecting Grounding Metadata

```typescript
const metadata = response.candidates?.[0]?.groundingMetadata

if (metadata) {
  // Search queries the model used
  console.log('Search queries:', metadata.webSearchQueries)

  // Source URLs and titles
  const sources = metadata.groundingChunks?.map(chunk => ({
    title: chunk.web?.title,
    uri: chunk.web?.uri,
  }))
  console.log('Sources:', sources)
}
```

## Key Points

- Pass `{ googleSearch: {} }` as a tool - no additional configuration needed
- The model decides when to use search based on the query
- Grounding metadata includes search queries and source URLs
- Works with both `generateContent` and `generateContentStream`

<!--
Source references:
- https://github.com/googleapis/js-genai/blob/main/codegen_instructions.md
- https://github.com/googleapis/js-genai/blob/main/sdk-samples/generate_content_with_search_grounding.ts
-->
