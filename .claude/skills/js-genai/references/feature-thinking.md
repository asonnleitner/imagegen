---
name: feature-thinking
description: Thinking and reasoning configuration for Gemini 2.5 and 3 models
---

# Thinking & Reasoning

Gemini 2.5 and 3 models support explicit thinking/reasoning for complex tasks. Thinking is enabled by default.

## Gemini 3 Models (thinkingLevel)

Control thinking depth with `thinkingLevel`:

```typescript
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({})

const response = await ai.models.generateContent({
  model: 'gemini-3-pro-preview',
  contents: 'Solve this math problem step by step: ...',
  config: {
    thinkingConfig: {
      thinkingLevel: 'LOW', // MINIMAL, LOW, MEDIUM, HIGH (default)
      includeThoughts: true, // See the model's reasoning
    },
  },
})

// Access thoughts if includeThoughts is true
for (const part of response.candidates?.[0]?.content?.parts ?? []) {
  if (part.thought) {
    console.log('Thought:', part.text)
  } else {
    console.log('Response:', part.text)
  }
}
```

### Thinking Levels

| Level | Flash | Pro | Best For |
|-------|-------|-----|----------|
| `MINIMAL` | Yes | No | Low-complexity, no reasoning needed |
| `LOW` | Yes | Yes | Simple tasks, faster/cheaper |
| `MEDIUM` | Yes | No | Moderate complexity |
| `HIGH` | Yes | Yes | Maximum reasoning depth (default) |

## Gemini 2.5 Models (thinkingBudget)

Control thinking with a token budget:

```typescript
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: 'What is AI?',
  config: {
    thinkingConfig: {
      thinkingBudget: 0,    // Turn thinking OFF (faster, cheaper)
      // thinkingBudget: 1024, // Specific token budget
    },
  },
})
```

## Key Points

- Gemini 3: use `thinkingLevel` (`MINIMAL`, `LOW`, `MEDIUM`, `HIGH`)
- Gemini 2.5: use `thinkingBudget` (0 to disable, or token count)
- Minimum budget for `gemini-2.5-pro` is 128 tokens (thinking cannot be fully disabled)
- `includeThoughts: true` returns the model's reasoning process in response parts
- Thought parts have `part.thought === true`
- Only Gemini 2.5/3 series support thinking configuration

<!--
Source references:
- https://github.com/googleapis/js-genai/blob/main/codegen_instructions.md
-->
