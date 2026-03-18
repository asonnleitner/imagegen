---
name: feature-structured-output
description: JSON schema enforcement for structured responses
---

# Structured Output (JSON Schema)

Force Gemini to return valid JSON matching a specific schema.

## Using responseJsonSchema (Recommended)

```typescript
import { GoogleGenAI, Type } from '@google/genai'

const ai = new GoogleGenAI({})

const response = await ai.models.generateContent({
  model: 'gemini-3-flash-preview',
  contents: 'List 3 popular cookie recipes with ingredients.',
  config: {
    responseMimeType: 'application/json',
    responseJsonSchema: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          recipeName: {
            type: Type.STRING,
            description: 'The name of the recipe.',
          },
          ingredients: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'The ingredients for the recipe.',
          },
        },
        propertyOrdering: ['recipeName', 'ingredients'],
      },
    },
  },
})

// response.text is guaranteed to be valid JSON matching the schema
const recipes = JSON.parse(response.text)
```

## Using responseSchema (Alternative)

```typescript
const response = await ai.models.generateContent({
  model: 'gemini-3-flash-preview',
  contents: 'List 3 cookie recipes.',
  config: {
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          recipeName: {
            type: Type.STRING,
            description: 'Name of the recipe',
            nullable: false,
          },
        },
        required: ['recipeName'],
      },
    },
  },
})
```

## Available Types

```typescript
import { Type } from '@google/genai'

Type.STRING   // OpenAPI string
Type.NUMBER   // OpenAPI number
Type.INTEGER  // OpenAPI integer
Type.BOOLEAN  // OpenAPI boolean
Type.ARRAY    // OpenAPI array (requires `items`)
Type.OBJECT   // OpenAPI object (requires `properties`, cannot be empty)
Type.NULL     // Null type
```

## Key Points

- Always set `responseMimeType: 'application/json'` alongside the schema
- `Type.OBJECT` must contain `properties` - it cannot be empty
- Use `propertyOrdering` to control the order of keys in output
- Use `nullable: true` to allow null values for a property
- `response.text` will contain valid JSON that matches the schema

<!--
Source references:
- https://github.com/googleapis/js-genai/blob/main/codegen_instructions.md
- https://github.com/googleapis/js-genai/blob/main/sdk-samples/generate_content_with_response_schema.ts
-->
