---
name: feature-multimodal-input
description: Multimodal inputs - images, audio, video, PDF via base64 or File API
---

# Multimodal Input

Gemini supports text, images, audio, video, and PDF as inputs.

## Local Files via Base64

For small files, encode as base64 inline data:

```typescript
import { GoogleGenAI, Part } from '@google/genai'
import * as fs from 'fs'

const ai = new GoogleGenAI({})

function fileToGenerativePart(path: string, mimeType: string): Part {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString('base64'),
      mimeType,
    },
  }
}

const imagePart = fileToGenerativePart('photo.jpg', 'image/jpeg')

const response = await ai.models.generateContent({
  model: 'gemini-3-flash-preview',
  contents: [imagePart, 'Describe this image in detail.'],
})

console.log(response.text)
```

## Common MIME Types

| Type | MIME Type |
|------|----------|
| JPEG | `image/jpeg` |
| PNG | `image/png` |
| WebP | `image/webp` |
| PDF | `application/pdf` |
| MP4 | `video/mp4` |
| MP3 | `audio/mp3` |
| WAV | `audio/wav` |

## File API (For Large Files)

For videos, long audio, or large PDFs, upload to the File API first:

```typescript
import { GoogleGenAI, createPartFromUri, createUserContent } from '@google/genai'

const ai = new GoogleGenAI({})

// Upload
const myFile = await ai.files.upload({
  file: 'video.mp4',
  config: { mimeType: 'video/mp4' },
})

// Generate
const response = await ai.models.generateContent({
  model: 'gemini-3-flash-preview',
  contents: createUserContent([
    createPartFromUri(myFile.uri, myFile.mimeType),
    'What happens in this video?',
  ]),
})

console.log(response.text)

// Clean up
await ai.files.delete({ name: myFile.name })
```

## Multiple Inputs

Combine text with multiple media parts:

```typescript
const response = await ai.models.generateContent({
  model: 'gemini-3-flash-preview',
  contents: [
    fileToGenerativePart('image1.jpg', 'image/jpeg'),
    fileToGenerativePart('image2.jpg', 'image/jpeg'),
    'Compare these two images.',
  ],
})
```

## Vertex AI: GCS URIs

On Vertex AI, reference files in Google Cloud Storage directly:

```typescript
const response = await ai.models.generateContent({
  model: 'gemini-3-flash-preview',
  contents: [{
    role: 'user',
    parts: [
      {
        fileData: {
          fileUri: 'gs://bucket/path/to/file.pdf',
          mimeType: 'application/pdf',
        },
      },
      { text: 'Summarize this document.' },
    ],
  }],
})
```

## Key Points

- Use base64 `inlineData` for small files (images, short audio)
- Use File API (`ai.files.upload`) for large files (video, long audio, large PDFs)
- File API is Gemini Developer API only (not Vertex AI upload)
- Always clean up uploaded files with `ai.files.delete()` after use
- `createPartFromUri` and `createUserContent` are helper functions for constructing content

<!--
Source references:
- https://github.com/googleapis/js-genai/blob/main/codegen_instructions.md
- https://github.com/googleapis/js-genai/blob/main/sdk-samples/generate_content_with_file_upload.ts
-->
