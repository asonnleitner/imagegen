---
name: features-files
description: Upload files, work with FileOutput streams, and configure file encoding strategies
---

# Files & FileOutput

## Uploading Files

Files are auto-uploaded when you pass `Blob`, `File`, or `Buffer` as prediction inputs. You can also upload manually:

```js
import fs from "node:fs/promises";

const file = await replicate.files.create(
  await fs.readFile("photo.png"),     // Blob, File, or Buffer
  { customer_id: "abc123" }           // optional metadata
);

// Use the file URL as input to a model
const output = await replicate.run("owner/model", {
  input: { image: file.urls.get },
});
```

Uploaded files expire after 24 hours. Max upload size is 100MiB.

## List / Get / Delete Files

```js
const page = await replicate.files.list();
const file = await replicate.files.get("file-id");
const deleted = await replicate.files.delete("file-id"); // returns true
```

## FileOutput (Model Output Streams)

When `replicate.run()` returns file data (images, audio, etc.), each file is a `FileOutput` object — a `ReadableStream` with extra methods:

```js
const [image] = await replicate.run("black-forest-labs/flux-schnell", {
  input: { prompt: "astronaut on a horse" },
});

// Get the source URL
console.log(image.url()); // URL object

// Get as Blob
const blob = await image.blob();

// Stream to an HTTP response
return new Response(image);

// Write to disk (Node.js)
import { writeFile } from "node:fs/promises";
await writeFile("output.png", image);

// Read chunks
for await (const chunk of image) {
  console.log(chunk); // Uint8Array
}
```

## Disable FileOutput

To get raw URL strings instead of `FileOutput` streams:

```js
const replicate = new Replicate({ useFileOutput: false });
const [url] = await replicate.run("owner/model", { input: { prompt: "hi" } });
// url is a plain string: "https://replicate.delivery/..."
```

## File Encoding Strategy

Controls how `Blob`/`Buffer` inputs are sent:

```js
const replicate = new Replicate({
  fileEncodingStrategy: "default", // try upload, fallback to data-uri
  // "upload"   — always upload to Replicate's file API
  // "data-uri" — encode as base64 data URI (max 10MB combined)
});
```

## Key Points

- File inputs (Blob/Buffer) in prediction inputs are auto-uploaded before the prediction is created
- `FileOutput.url()` may not always return an HTTP URL in future — prefer `.blob()` or streaming
- Data URI encoding has a 10MB combined limit for all file inputs in a single prediction
- The `"default"` strategy tries upload first, falls back to data-uri on server errors

<!--
Source references:
- https://github.com/replicate/replicate-javascript/blob/main/README.md
- https://github.com/replicate/replicate-javascript/blob/main/lib/files.js
- https://github.com/replicate/replicate-javascript/blob/main/lib/stream.js
- https://github.com/replicate/replicate-javascript/blob/main/lib/util.js
-->
