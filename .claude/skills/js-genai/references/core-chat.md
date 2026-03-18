---
name: core-chat
description: Multi-turn conversation sessions with automatic history management
---

# Multi-turn Chat

The `ai.chats` module provides stateful chat sessions that automatically track conversation history.

## Basic Chat

```typescript
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({})

const chat = ai.chats.create({ model: 'gemini-3-flash-preview' })

const response1 = await chat.sendMessage({ message: 'I have a cat named Whiskers.' })
console.log(response1.text)

const response2 = await chat.sendMessage({ message: 'What is the name of my pet?' })
console.log(response2.text) // Will remember Whiskers
```

## Streaming Chat

```typescript
const chat = ai.chats.create({ model: 'gemini-3-flash-preview' })

const stream = await chat.sendMessageStream({
  message: 'Tell me a story about a robot.',
})

for await (const chunk of stream) {
  process.stdout.write(chunk.text)
}

// Send follow-up (history is preserved)
const stream2 = await chat.sendMessageStream({
  message: 'Make the robot a villain.',
})

for await (const chunk of stream2) {
  process.stdout.write(chunk.text)
}
```

## Accessing Chat History

```typescript
const chat = ai.chats.create({ model: 'gemini-3-flash-preview' })

await chat.sendMessage({ message: 'Why is the sky blue?' })
await chat.sendMessage({ message: 'Why is the sunset red?' })

const history = chat.getHistory()
for (const content of history) {
  console.log(`${content.role}: ${content.parts[0].text}`)
}
```

## Chat with Configuration

```typescript
const chat = ai.chats.create({
  model: 'gemini-3-flash-preview',
  config: {
    systemInstruction: 'You are a helpful assistant.',
    temperature: 0.7,
    tools: [{ functionDeclarations: [/* ... */] }],
  },
})
```

## Image Editing with Chat

Chat mode is recommended for image editing with Gemini native image models:

```typescript
import * as fs from 'fs'

const imageBase64 = fs.readFileSync('image.png').toString('base64')

const chat = ai.chats.create({ model: 'gemini-2.5-flash-image' })

const response = await chat.sendMessage({
  content: [
    { inlineData: { mimeType: 'image/png', data: imageBase64 } },
    'Make the background blue.',
  ],
})

for (const part of response.candidates[0].content.parts) {
  if (part.inlineData) {
    fs.writeFileSync('edited.png', Buffer.from(part.inlineData.data, 'base64'))
  }
}
```

## Key Points

- `ai.chats.create()` returns a local `Chat` object (not an API call)
- History is tracked automatically - no need to manage `contents` arrays
- Both `sendMessage` and `sendMessageStream` are supported
- Chat works with all config options (tools, safety, thinking, etc.)

<!--
Source references:
- https://github.com/googleapis/js-genai/blob/main/README.md
- https://github.com/googleapis/js-genai/blob/main/codegen_instructions.md
- https://github.com/googleapis/js-genai/blob/main/sdk-samples/chats.ts
-->
