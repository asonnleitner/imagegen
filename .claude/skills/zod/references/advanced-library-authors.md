---
name: advanced-library-authors
description: Building libraries on top of Zod — Standard Schema, peer deps, core imports
---

# Library Authors

Patterns for building libraries that depend on Zod.

## Standard Schema

For libraries that only need black-box validation, consider [Standard Schema](https://standardschema.dev/) instead of a direct Zod dependency. It works with Zod, Valibot, ArkType, and others.

## Peer Dependencies

```json
{
  "peerDependencies": {
    "zod": "^3.25.0 || ^4.0.0"
  }
}
```

## Import Paths

| Use Case | Import |
|----------|--------|
| Library code (supports Zod + Zod Mini) | `"zod/v4/core"` |
| Zod 3 compatibility | `"zod/v3"` |

**Never import from these in library code:**
- `"zod"` (root) — ties to specific Zod version
- `"zod/v4"` — excludes Zod Mini users
- `"zod/v4/mini"` — excludes Zod users

## Accepting Schemas

```ts
import type * as z4 from "zod/v4/core";

// use extends, not generic argument
function validate<T extends z4.$ZodType>(schema: T, data: unknown) {
  return z4.parse(schema, data);
}

// DON'T do this:
// function validate(schema: z4.$ZodType<string>) { ... }
```

## Parsing with Core

```ts
import * as z4 from "zod/v4/core";

// use top-level parse functions
z4.parse(schema, data);
z4.safeParse(schema, data);
await z4.parseAsync(schema, data);
await z4.safeParseAsync(schema, data);
```

## Runtime Version Detection

Differentiate Zod 3 from Zod 4 at runtime:

```ts
function isZod4(schema: unknown): boolean {
  return typeof schema === "object" && schema !== null && "_zod" in schema;
}
```

## Key Points

- Import from `"zod/v4/core"` to support both Zod and Zod Mini
- Use `<T extends z4.$ZodType>` for accepting schemas
- Use top-level `z4.parse()` instead of `schema.parse()` in library code
- Check `"_zod" in schema` to detect v4 vs v3 at runtime

<!--
Source references:
- https://github.com/colinhacks/zod/blob/main/packages/docs/content/library-authors.mdx
-->
