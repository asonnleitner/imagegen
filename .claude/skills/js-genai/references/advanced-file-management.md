---
name: advanced-file-management
description: File upload, download, status polling, and content creation helpers
---

# File Management

The `ai.files` module handles file upload, download, and management. Use it for files too large for inline base64 or files referenced across multiple requests.

## Upload a File

```typescript
import { GoogleGenAI, createPartFromUri } from '@google/genai'

const ai = new GoogleGenAI({})

// Upload from a Blob
const blob = new Blob(['File content here'], { type: 'text/plain' })
const file = await ai.files.upload({
  file: blob,
  config: { displayName: 'my-file.txt' },
})

// Upload from a file path (Node.js)
const file2 = await ai.files.upload({
  file: 'path/to/video.mp4',
  config: { mimeType: 'video/mp4' },
})
```

## Wait for Processing

Large files (videos, PDFs) may need processing time:

```typescript
let getFile = await ai.files.get({ name: file.name })

while (getFile.state === 'PROCESSING') {
  console.log('File is processing...')
  await new Promise(resolve => setTimeout(resolve, 5000))
  getFile = await ai.files.get({ name: file.name })
}

if (getFile.state === 'FAILED') {
  throw new Error('File processing failed.')
}
```

## Use File in Content

```typescript
const response = await ai.models.generateContent({
  model: 'gemini-3-flash-preview',
  contents: [
    'Summarize this document.',
    createPartFromUri(file.uri, file.mimeType),
  ],
})
```

## Download a File

```typescript
// Download generated videos or other files
await ai.files.download({
  file: videoFile,
  downloadPath: 'output.mp4',
})
```

## Delete a File

```typescript
await ai.files.delete({ name: file.name })
```

## Key Points

- File API is for Gemini Developer API only (not Vertex AI uploads)
- Always poll file state before using - large files need processing time
- File states: `PROCESSING`, `ACTIVE`, `FAILED`
- Use `createPartFromUri(uri, mimeType)` to create a Part from an uploaded file
- Clean up files after use with `ai.files.delete()`

<!--
Source references:
- https://github.com/googleapis/js-genai/blob/main/README.md
- https://github.com/googleapis/js-genai/blob/main/sdk-samples/generate_content_with_file_upload.ts
-->
