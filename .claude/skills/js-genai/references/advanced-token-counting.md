---
name: advanced-token-counting
description: Count tokens before sending requests, including multi-turn conversations
---

# Token Counting

Count tokens in content before sending requests to estimate costs and check limits.

## Simple String

```typescript
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({})

const result = await ai.models.countTokens({
  model: 'gemini-2.0-flash',
  contents: 'The quick brown fox jumps over the lazy dog.',
})

console.log('Total tokens:', result.totalTokens)
```

## Structured Content

```typescript
const result = await ai.models.countTokens({
  model: 'gemini-2.0-flash',
  contents: [{ role: 'user', parts: [{ text: 'Hello, how are you?' }] }],
})
```

## Multi-turn Conversation

```typescript
const result = await ai.models.countTokens({
  model: 'gemini-2.0-flash',
  contents: [
    { role: 'user', parts: [{ text: 'What is the capital of France?' }] },
    { role: 'model', parts: [{ text: 'The capital of France is Paris.' }] },
    { role: 'user', parts: [{ text: 'What about Spain?' }] },
  ],
})

console.log('Total tokens:', result.totalTokens)
```

## Key Points

- Use `countTokens` to check content size before sending expensive requests
- Accepts the same content formats as `generateContent`
- Useful for cost estimation and staying within model token limits

<!--
Source references:
- https://github.com/googleapis/js-genai/blob/main/sdk-samples/count_tokens.ts
-->
