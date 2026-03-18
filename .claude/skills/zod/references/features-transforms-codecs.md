---
name: features-transforms-codecs
description: Zod transforms, pipes, preprocess, and bidirectional codecs
---

# Transforms & Codecs

Unidirectional transforms, schema pipes, and bidirectional codecs.

## Transforms

Change the output type of a schema:

```ts
const StringToNumber = z.string().transform((val) => Number(val));
// input: string, output: number

// standalone transform
const Double = z.transform((val: number) => val * 2);
```

## Overwrite

Type-preserving transform — input and output types remain the same:

```ts
z.string().overwrite((val) => val.trim().toLowerCase());
// input: string, output: string (type preserved)
```

## Pipes

Chain schemas together — output of first feeds into input of second:

```ts
z.string()
  .transform((val) => Number(val))
  .pipe(z.number().min(0));
// string -> transform to number -> validate number >= 0
```

## Preprocess

Transform input before validation:

```ts
z.preprocess((val) => String(val), z.string().min(1));
```

## Codecs (v4.1+)

Bidirectional transformations between input and output schemas. Support both `.decode()` (forward) and `.encode()` (backward).

```ts
const stringToDate = z.codec(z.iso.datetime(), z.date(), {
  decode: (isoString) => new Date(isoString),
  encode: (date) => date.toISOString(),
});

// forward: string -> Date
stringToDate.parse("2024-01-15T00:00:00Z");  // Date (accepts unknown)
stringToDate.decode("2024-01-15T00:00:00Z"); // Date (strongly typed input)

// backward: Date -> string
stringToDate.encode(new Date()); // "2024-01-15T00:00:00.000Z"

// safe variants
stringToDate.safeDecode("...");
stringToDate.safeEncode(new Date());

// async variants
await stringToDate.decodeAsync("...");
await stringToDate.encodeAsync(new Date());
```

## Built-in Codec Recipes

Import from `"zod"`:

```ts
import * as z from "zod";

// string <-> number
z.stringToNumber();    // "42" <-> 42
z.stringToInt();       // "42" <-> 42 (integer only)
z.stringToBigInt();    // "42" <-> 42n

// number <-> bigint
z.numberToBigInt();    // 42 <-> 42n

// datetime <-> Date
z.isoDatetimeToDate();   // ISO string <-> Date
z.epochSecondsToDate();  // epoch seconds <-> Date
z.epochMillisToDate();   // epoch millis <-> Date

// JSON
z.json(z.object({ name: z.string() }));
// string <-> parsed object

// encoding
z.utf8ToBytes();       // string <-> Uint8Array
z.bytesToUtf8();       // Uint8Array <-> string
z.base64ToBytes();     // base64 string <-> Uint8Array
z.base64urlToBytes();  // base64url string <-> Uint8Array
z.hexToBytes();        // hex string <-> Uint8Array

// URL
z.stringToURL();       // string <-> URL
z.stringToHttpURL();   // HTTP(S) string <-> URL
z.uriComponent();      // encoded <-> decoded URI component
```

## Encoding Behavior

How different schema types behave during `.encode()`:

| Schema Type | Encode Behavior |
|-------------|----------------|
| Codec | Runs `encode` function |
| Pipe `A.pipe(B)` | Reversed: B encodes first, then A |
| Refinements | Checked in both directions (two-pass) |
| Defaults/Prefaults/Catch | Only applied in forward direction |
| `.transform()` | Throws Error (unidirectional only) |

## Key Points

- Use `.transform()` for one-way conversions
- Use `z.codec()` when you need bidirectional conversion (e.g., serialization)
- `.overwrite()` preserves the type (useful for normalization)
- `.pipe()` chains schemas — the output of the first must match the input of the second
- Built-in codec recipes cover common string-to-type conversions

<!--
Source references:
- https://github.com/colinhacks/zod/blob/main/packages/docs/content/api.mdx
- https://github.com/colinhacks/zod/blob/main/packages/docs/content/codecs.mdx
-->
