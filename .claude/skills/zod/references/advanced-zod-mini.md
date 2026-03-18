---
name: advanced-zod-mini
description: Zod Mini — tree-shakable variant with functional API (64% smaller core bundle)
---

# Zod Mini

Tree-shakable variant of Zod with a functional API. 64% smaller core bundle (2.12kb vs 5.91kb for `z.boolean().parse(true)`).

## Import

```ts
import * as z from "zod/mini";
```

## Key Difference: Functional API

Zod Mini uses wrapper functions instead of chainable methods:

```ts
// Zod:
z.string().optional().nullable();

// Zod Mini:
z.nullable(z.optional(z.string()));
```

## `.check()` for Validations

Use `.check()` with validation functions instead of chained methods:

```ts
// Zod:
z.string().min(5).max(10).trim();

// Zod Mini:
z.string().check(z.minLength(5), z.maxLength(10), z.trim());
```

### Available Checks

```ts
// numeric
z.lt(n), z.lte(n), z.gt(n), z.gte(n)
z.positive(), z.negative()
z.multipleOf(n)

// size (sets, maps, files)
z.maxSize(n), z.minSize(n), z.size(n)

// length (strings, arrays)
z.maxLength(n), z.minLength(n), z.length(n)

// string patterns
z.regex(pattern)
z.lowercase(), z.uppercase()
z.includes(str), z.startsWith(str), z.endsWith(str)

// string transforms
z.trim(), z.toLowerCase(), z.toUpperCase(), z.normalize()

// object
z.property(key, schema)

// file
z.mime(types)

// custom
z.refine(fn, opts), z.check(fn)
z.overwrite(fn)

// metadata
z.meta(data), z.describe(str)
```

## No Default Locale

Zod Mini does not load any locale by default. Load manually:

```ts
import * as z from "zod/mini";
z.config(z.locales.en());
```

## When to Use Zod Mini

**Use when:**
- Building client-side libraries where bundle size matters
- Targeting slow mobile connections
- Every kilobyte counts

**Don't use when:**
- Backend/server-side code (bundle size doesn't matter)
- Developer experience is more important than bundle size
- Most frontend applications (the difference is negligible)

## Compatibility

Both Zod and Zod Mini schemas extend `$ZodType` from `zod/v4/core`. Libraries built on `zod/v4/core` work with both.

<!--
Source references:
- https://github.com/colinhacks/zod/blob/main/packages/docs/content/packages/mini.mdx
-->
