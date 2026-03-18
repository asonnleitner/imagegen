---
name: advanced-interactions
description: Beta Interactions API for stateful conversations, agents, and deep research
---

# Interactions API (Beta)

The Interactions API provides a unified interface for stateful conversations with server-side state management. It supports agents, tools, and multimodal I/O.

> **Warning:** Experimental feature. Schemas may have breaking changes.

## Basic Interaction

```typescript
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({})

const interaction = await ai.interactions.create({
  model: 'gemini-2.5-flash',
  input: 'Hello, how are you?',
})

console.log(interaction)
```

## Stateful Conversation

Chain interactions using `previous_interaction_id`:

```typescript
const turn1 = await ai.interactions.create({
  model: 'gemini-2.5-flash',
  input: 'Hi, my name is Amir.',
})

const turn2 = await ai.interactions.create({
  model: 'gemini-2.5-flash',
  input: 'What is my name?',
  previous_interaction_id: turn1.id,
})
// Model remembers: "Your name is Amir."
```

## Deep Research Agent

```typescript
// Start background research
const research = await ai.interactions.create({
  input: 'Research the history of Google TPUs.',
  agent: 'deep-research-pro-preview-12-2025',
  background: true,
})

// Poll for results
while (true) {
  const status = await ai.interactions.get(research.id)
  console.log('Status:', status.status)

  if (status.status === 'completed') {
    console.log('Report:', status.outputs)
    break
  }
  if (['failed', 'cancelled'].includes(status.status)) break

  await new Promise(r => setTimeout(r, 10000))
}
```

## Function Calling

```typescript
let interaction = await ai.interactions.create({
  model: 'gemini-2.5-flash',
  input: 'What is the weather in Mountain View, CA?',
  tools: [{
    type: 'function',
    name: 'get_weather',
    description: 'Gets the weather for a given location.',
    parameters: {
      type: 'object',
      properties: {
        location: { type: 'string', description: 'City and state' },
      },
      required: ['location'],
    },
  }],
})

// Handle tool calls
for (const output of interaction.outputs ?? []) {
  if (output.type === 'function_call') {
    const result = getWeather(output.arguments.location)

    interaction = await ai.interactions.create({
      model: 'gemini-2.5-flash',
      previous_interaction_id: interaction.id,
      input: [{
        type: 'function_result',
        name: output.name,
        call_id: output.id,
        result,
      }],
    })
  }
}
```

## Built-in Tools

```typescript
// Google Search
await ai.interactions.create({
  model: 'gemini-2.5-flash',
  input: 'Who won the last Super Bowl?',
  tools: [{ type: 'google_search' }],
})

// Code Execution
await ai.interactions.create({
  model: 'gemini-2.5-flash',
  input: 'Calculate the 50th Fibonacci number.',
  tools: [{ type: 'code_execution' }],
})
```

## Multimodal Output

```typescript
import * as fs from 'fs'

const interaction = await ai.interactions.create({
  model: 'gemini-3-pro-image-preview',
  input: 'Generate an image of a futuristic city.',
  response_modalities: ['image'],
})

for (const output of interaction.outputs ?? []) {
  if (output.type === 'image') {
    fs.writeFileSync('city.png', Buffer.from(output.data, 'base64'))
  }
}
```

## Key Points

- Server-side state management via `previous_interaction_id`
- Supports specialized agents like `deep-research-pro-preview-12-2025`
- `background: true` for long-running tasks with polling
- Built-in tools: `google_search`, `code_execution`
- Not yet supported on Vertex AI

<!--
Source references:
- https://github.com/googleapis/js-genai/blob/main/README.md
-->
