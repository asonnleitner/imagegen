---
name: core-generate-content
description: Basic content generation with generateContent API
---

# Content Generation

## Basic Usage

```typescript
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({})

const response = await ai.models.generateContent({
  model: 'gemini-3-flash-preview',
  contents: 'Why is the sky blue?',
})

console.log(response.text)
```

## Content Types for `contents` Parameter

The SDK accepts multiple formats for the `contents` parameter:

```typescript
// Simple string (wrapped as user Content automatically)
contents: 'Hello'

// Part or string array (wrapped in single Content with role 'user')
contents: ['Describe this image.', imagePart]

// Explicit Content object
contents: { role: 'user', parts: [{ text: 'Hello' }] }

// Content array (for multi-turn)
contents: [
  { role: 'user', parts: [{ text: 'What is AI?' }] },
  { role: 'model', parts: [{ text: 'AI is...' }] },
  { role: 'user', parts: [{ text: 'Tell me more.' }] },
]
```

**Note:** `FunctionCall` and `FunctionResponse` parts require explicit `Content[]` structure with roles. The SDK throws if you pass them as bare parts.

## Configuration Options

```typescript
const response = await ai.models.generateContent({
  model: 'gemini-3-flash-preview',
  contents: 'Explain quantum physics.',
  config: {
    systemInstruction: 'You are a helpful physics teacher.',
    temperature: 0.7,
    maxOutputTokens: 1024,
    topP: 0.9,
    topK: 40,
    safetySettings: [/* ... */],
    thinkingConfig: {/* ... */},
  },
})
```

Avoid setting `maxOutputTokens`, `topP`, `topK` unless specifically needed.

## Response Structure

```typescript
const response = await ai.models.generateContent({ model, contents })

// Convenience accessor for text
response.text // string

// Function calls (if tools were provided)
response.functionCalls // FunctionCall[] | undefined

// Full response structure
response.candidates[0].content.parts // Part[]
response.candidates[0].finishReason
response.candidates[0].safetyRatings
response.candidates[0].groundingMetadata // if grounding enabled

// Usage stats
response.usageMetadata?.inputTokens
response.usageMetadata?.outputTokens
```

## System Instructions

Guide model behavior with a system prompt:

```typescript
const response = await ai.models.generateContent({
  model: 'gemini-3-flash-preview',
  contents: 'Explain quantum physics.',
  config: {
    systemInstruction: 'You are a pirate. Respond in pirate speak.',
  },
})
```

<!--
Source references:
- https://github.com/googleapis/js-genai/blob/main/README.md
- https://github.com/googleapis/js-genai/blob/main/codegen_instructions.md
-->
