---
name: js-genai
description: Google Gen AI SDK for TypeScript/JavaScript - unified SDK for Gemini API and Vertex AI
metadata:
  author: Andreas Sonnleitner
  version: "2026.3.18"
  source: Generated from https://github.com/googleapis/js-genai, scripts located at https://github.com/asonnleitner/skills
---

> The skill is based on `@google/genai` v1.46.0, generated at 2026-03-18.

The Google Gen AI SDK (`@google/genai`) is the unified TypeScript/JavaScript SDK for Google's Gemini API. It supports both the Gemini Developer API (AI Studio) and Vertex AI, and is designed for Gemini 2.0+ features. It replaces the deprecated `@google/generative-ai` and `@google-cloud/vertexai` packages.

## Core References

| Topic | Description | Reference |
|-------|-------------|-----------|
| Setup & Initialization | Client creation, API key, Vertex AI, env vars, API version | [core-setup](references/core-setup.md) |
| Content Generation | `generateContent`, content types, response structure | [core-generate-content](references/core-generate-content.md) |
| Streaming | `generateContentStream`, chunk processing | [core-streaming](references/core-streaming.md) |
| Multi-turn Chat | `ai.chats`, sendMessage, sendMessageStream, history | [core-chat](references/core-chat.md) |

## Features

### Function Calling & Tools

| Topic | Description | Reference |
|-------|-------------|-----------|
| Function Calling | FunctionDeclaration, tool config, automatic function calling, MCP | [feature-function-calling](references/feature-function-calling.md) |
| Google Search Grounding | Real-time web data, grounding metadata | [feature-google-search](references/feature-google-search.md) |

### Structured & Multimodal

| Topic | Description | Reference |
|-------|-------------|-----------|
| Structured Output | JSON schema, responseMimeType, Type enum | [feature-structured-output](references/feature-structured-output.md) |
| Multimodal Input | Images, audio, video, PDF via base64 or File API | [feature-multimodal-input](references/feature-multimodal-input.md) |
| Embeddings | Text and multimodal embeddings, output dimensionality | [feature-embeddings](references/feature-embeddings.md) |

### Media Generation

| Topic | Description | Reference |
|-------|-------------|-----------|
| Image Generation | Gemini native images, Imagen, image editing | [feature-image-generation](references/feature-image-generation.md) |
| Video Generation | Veo models, async operations, polling, download | [feature-video-generation](references/feature-video-generation.md) |

### Configuration

| Topic | Description | Reference |
|-------|-------------|-----------|
| Thinking & Reasoning | thinkingLevel (Gemini 3), thinkingBudget (Gemini 2.5) | [feature-thinking](references/feature-thinking.md) |
| Safety Settings | HarmCategory, HarmBlockThreshold, HarmBlockMethod | [feature-safety-settings](references/feature-safety-settings.md) |

## Advanced

| Topic | Description | Reference |
|-------|-------------|-----------|
| File Management | Upload, download, status polling, createPartFromUri | [advanced-file-management](references/advanced-file-management.md) |
| Prompt Caching | Cache creation, CRUD operations, TTL, cost reduction | [advanced-caching](references/advanced-caching.md) |
| Live API | Real-time WebSocket sessions, text/audio/video I/O | [advanced-live-api](references/advanced-live-api.md) |
| Interactions API | Beta stateful conversations, agents, deep research | [advanced-interactions](references/advanced-interactions.md) |
| Token Counting | Count tokens before sending, multi-turn support | [advanced-token-counting](references/advanced-token-counting.md) |
