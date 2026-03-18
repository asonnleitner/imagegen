---
name: features-json-schema
description: Convert Zod schemas to and from JSON Schema
---

# JSON Schema

First-party JSON Schema conversion in Zod 4.

## Zod to JSON Schema

```ts
import * as z from "zod";

const User = z.object({
  name: z.string(),
  email: z.email(),
  age: z.number().min(0),
});

const jsonSchema = z.toJSONSchema(User);
// {
//   type: "object",
//   properties: {
//     name: { type: "string" },
//     email: { type: "string", format: "email" },
//     age: { type: "number", minimum: 0 }
//   },
//   required: ["name", "email", "age"]
// }
```

## Options

```ts
z.toJSONSchema(schema, {
  // JSON Schema draft version
  target: "draft-2020-12", // default
  // also: "draft-07", "draft-04", "openapi-3.0"

  // which side to represent (for transforms/codecs)
  io: "output",  // default
  // also: "input"

  // how to handle unrepresentable types
  unrepresentable: "throw", // default — throws error
  // also: "any" — converts to {} (any)

  // how to handle circular references
  cycles: "ref",   // default — uses $ref
  // also: "throw"

  // how to handle reused schemas
  reused: "inline", // default — inlines definitions
  // also: "ref" — extracts to $defs with $ref

  // custom conversion override
  override: (ctx, zodSchema, jsonSchema) => {
    // return modified jsonSchema or undefined to use default
    return jsonSchema;
  },
});
```

## Registry-Based Conversion

Generate multiple interlinked schemas with `$ref`:

```ts
const registry = z.registry<{ id: string }>();

const Address = z.object({ street: z.string(), city: z.string() })
  .register(registry, { id: "Address" });

const User = z.object({ name: z.string(), address: Address })
  .register(registry, { id: "User" });

const jsonSchema = z.toJSONSchema(User, { metadata: registry });
// Uses $ref to reference Address definition
```

## JSON Schema to Zod (Experimental)

```ts
const zodSchema = z.fromJSONSchema({
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "number" },
  },
  required: ["name"],
});
```

## String Format Mapping

| Zod | JSON Schema |
|-----|-------------|
| `z.email()` | `format: "email"` |
| `z.uuid()` | `format: "uuid"` |
| `z.url()` | `format: "uri"` |
| `z.ipv4()` | `format: "ipv4"` |
| `z.ipv6()` | `format: "ipv6"` |
| `z.iso.datetime()` | `format: "date-time"` |
| `z.iso.date()` | `format: "date"` |
| `z.iso.time()` | `format: "time"` |
| `z.iso.duration()` | `format: "duration"` |
| `z.base64()` | `contentEncoding: "base64"` |

## Unrepresentable Types

These cannot be converted to JSON Schema (will throw or become `{}` based on `unrepresentable` setting):

`z.bigint()`, `z.int64()`, `z.uint64()`, `z.symbol()`, `z.undefined()`, `z.void()`, `z.date()`, `z.map()`, `z.set()`, `z.transform()`, `z.nan()`, `z.custom()`

<!--
Source references:
- https://github.com/colinhacks/zod/blob/main/packages/docs/content/json-schema.mdx
-->
