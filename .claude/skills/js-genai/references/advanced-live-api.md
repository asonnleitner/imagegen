---
name: advanced-live-api
description: Real-time WebSocket interaction with text, audio, and video I/O
---

# Live API

The Live API enables real-time, bi-directional communication via WebSocket. Supports text, audio, and video input/output.

## Basic Text Session

```typescript
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: 'KEY', apiVersion: 'v1alpha' })

const session = await ai.live.connect({
  model: 'gemini-live-2.5-flash-preview',
  callbacks: {
    onopen: () => console.log('Connected'),
    onmessage: (message: LiveServerMessage) => {
      const text = message.serverContent?.modelTurn?.parts?.[0]?.text
      if (text) console.log('Model:', text)

      if (message.serverContent?.turnComplete) {
        console.log('--- Turn complete ---')
      }
    },
    onerror: (e: ErrorEvent) => console.error('Error:', e.message),
    onclose: (e: CloseEvent) => console.log('Closed:', e.reason),
  },
  config: {
    responseModalities: [Modality.TEXT],
  },
})

// Send a message
session.sendClientContent({ turns: 'Hello world' })

// Close when done
session.close()
```

## Ephemeral Tokens (for Client-Side Use)

Generate short-lived tokens to connect from the browser without exposing API keys:

```typescript
const ai = new GoogleGenAI({ apiKey: 'SERVER_KEY', apiVersion: 'v1alpha' })

const model = 'gemini-live-2.5-flash-preview'

// Create an ephemeral token on the server
const token = await ai.authTokens.create({
  config: {
    uses: 1,
    liveConnectConstraints: {
      model,
      config: { responseModalities: [Modality.TEXT] },
    },
  },
})

// Pass token to client - they connect with it instead of the API key
const clientAi = new GoogleGenAI({
  apiKey: token.name,
  apiVersion: 'v1alpha',
})
```

## Key Points

- Requires `apiVersion: 'v1alpha'` for the Live API
- Use `gemini-live-2.5-flash-preview` model
- Communication is event-driven via callbacks
- `sendClientContent` sends messages, `message.serverContent.turnComplete` signals end of turn
- Ephemeral tokens enable secure client-side connections
- Supports text, audio, and video modalities
- Live API is experimental and may change

<!--
Source references:
- https://github.com/googleapis/js-genai/blob/main/README.md
- https://github.com/googleapis/js-genai/blob/main/sdk-samples/live_ephemeral.ts
-->
