---
name: feature-function-calling
description: Function calling, tools, automatic function calling, and MCP support
---

# Function Calling

Function calling lets Gemini interact with external systems by requesting function executions and receiving results.

## Manual Function Calling (4-step flow)

1. Declare the function schema
2. Call `generateContent` with the tool
3. Execute the function with returned parameters
4. Send the result back as a `FunctionResponse`

```typescript
import { GoogleGenAI, FunctionCallingConfigMode, Type } from '@google/genai'

const ai = new GoogleGenAI({})

// 1. Declare function schema
const controlLightDeclaration = {
  name: 'controlLight',
  parameters: {
    type: Type.OBJECT,
    description: 'Set brightness and color temperature of a light.',
    properties: {
      brightness: { type: Type.NUMBER, description: 'Light level 0-100.' },
      colorTemperature: { type: Type.STRING, description: '`daylight`, `cool`, or `warm`.' },
    },
    required: ['brightness', 'colorTemperature'],
  },
}

// 2. Call with tools
const response = await ai.models.generateContent({
  model: 'gemini-3-flash-preview',
  contents: 'Dim the lights so the room feels cozy.',
  config: {
    tools: [{ functionDeclarations: [controlLightDeclaration] }],
    toolConfig: {
      functionCallingConfig: {
        mode: FunctionCallingConfigMode.ANY, // Force function call
        allowedFunctionNames: ['controlLight'],
      },
    },
  },
})

// 3. Execute the function
if (response.functionCalls) {
  console.log(response.functionCalls)
  // [{ name: 'controlLight', args: { brightness: 25, colorTemperature: 'warm' } }]
}
```

## Function Calling Config Modes

- `AUTO` - Model decides whether to call a function or respond with text (default)
- `ANY` - Force the model to always call a function
- `NONE` - Prevent function calls entirely

## Automatic Function Calling (AFC)

Use `CallableTool` to let the SDK handle the function call loop automatically:

```typescript
import { CallableTool, FunctionCall, Part, GoogleGenAI, FunctionCallingConfigMode, Type } from '@google/genai'

const ai = new GoogleGenAI({})

const controlLightTool: CallableTool = {
  // Provide the function declaration
  tool: async () => ({
    functionDeclarations: [{
      name: 'controlLight',
      parameters: {
        type: Type.OBJECT,
        properties: {
          brightness: { type: Type.NUMBER },
          colorTemperature: { type: Type.STRING },
        },
        required: ['brightness', 'colorTemperature'],
      },
    }],
  }),
  // Implement the actual function
  callTool: async (params: FunctionCall[]): Promise<Part[]> => {
    console.log('Tool called with:', params)
    return [{
      functionResponse: {
        name: 'controlLight',
        response: { brightness: 25, colorTemperature: 'warm' },
      },
    }]
  },
}

// SDK handles the call-respond loop automatically
const response = await ai.models.generateContentStream({
  model: 'gemini-3-flash-preview',
  contents: 'Dim the lights.',
  config: {
    tools: [controlLightTool],
    toolConfig: {
      functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO },
    },
    systemInstruction: 'You can control lights. Report the new values.',
  },
})

for await (const chunk of response) {
  if (chunk.text) console.log(chunk.text)
}
```

## MCP Support (Experimental)

Pass a Model Context Protocol server as a tool directly:

```typescript
import { GoogleGenAI, mcpToTool } from '@google/genai'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const transport = new StdioClientTransport({
  command: 'npx',
  args: ['-y', '@philschmid/weather-mcp'],
})

const client = new Client({ name: 'example-client', version: '1.0.0' })
await client.connect(transport)

const ai = new GoogleGenAI({})

const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: 'What is the weather in London?',
  config: {
    tools: [mcpToTool(client)], // Automatic function calling via MCP
  },
})

console.log(response.text)
await client.close()
```

Requires peer dependency: `npm install @modelcontextprotocol/sdk`

## Key Points

- Use `Type` enum for schema types (`Type.OBJECT`, `Type.STRING`, `Type.NUMBER`, etc.)
- `response.functionCalls` contains the array of requested function calls
- `CallableTool` enables automatic function calling - the SDK loops until the model gives a text response
- MCP support is experimental and uses automatic function calling internally

<!--
Source references:
- https://github.com/googleapis/js-genai/blob/main/README.md
- https://github.com/googleapis/js-genai/blob/main/codegen_instructions.md
- https://github.com/googleapis/js-genai/blob/main/sdk-samples/generate_content_with_function_calling.ts
- https://github.com/googleapis/js-genai/blob/main/sdk-samples/generate_content_afc_streaming.ts
-->
