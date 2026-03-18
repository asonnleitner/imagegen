---
name: advanced-migration-v3-v4
description: Breaking changes and migration patterns from Zod 3 to Zod 4
---

# Migration from Zod 3 to Zod 4

Key breaking changes and migration patterns. Zod 3 is still available via `import * as z from "zod/v3"`.

## Import Changes

```ts
// Zod 4
import * as z from "zod";

// Zod 4 Mini
import * as z from "zod/mini";

// Zod 3 (backward compat)
import * as z from "zod/v3";
```

## Error Customization

```ts
// v3
z.string({ message: "Required" });
z.string({ invalid_type_error: "Not a string", required_error: "Required" });
z.string({ errorMap: (iss, ctx) => ({ message: "..." }) });

// v4 — unified `error` parameter
z.string("Not a string!");
z.string({ error: "Not a string!" });
z.string({ error: (iss) => iss.input === undefined ? "Required" : "Not a string" });
```

## Number Changes

```ts
// v3: z.number() accepted NaN and Infinity
// v4: z.number() is finite-only (no NaN, no Infinity)

// v3: .safe() for safe integers
// v4: .int() or z.int() for safe integers (.safe() removed)
```

## String Format Methods → Top-Level Functions

```ts
// v3
z.string().email();
z.string().uuid();
z.string().url();
z.string().ip();
z.string().datetime();

// v4
z.email();
z.uuid();
z.url();
z.ipv4();  // .ip() split into ipv4/ipv6
z.ipv6();
z.iso.datetime();
```

## Object Changes

```ts
// v3
z.object({}).strict();
z.object({}).passthrough();
z.object({}).merge(other);
z.object({}).deepPartial();

// v4
z.strictObject({});
z.looseObject({});
obj.extend(other.shape);     // or { ...A.shape, ...B.shape }
// deepPartial removed — no replacement
```

## Record Changes

```ts
// v3: key arg was optional
z.record(z.number()); // Record<string, number>

// v4: two args required
z.record(z.string(), z.number());

// v3: enum keys were partial
// v4: enum keys are exhaustive — use z.partialRecord() for partial
z.partialRecord(z.enum(["a", "b"]), z.number());
```

## Default Behavior

```ts
// v3: .default() passed value through parser
z.string().trim().default("  hello  "); // "hello"

// v4: .default() short-circuits (returns default directly, not parsed)
z.string().trim().default("  hello  "); // "  hello  "

// v4: use .prefault() for old behavior
z.string().trim().prefault("  hello  "); // "hello"
```

## Native Enum

```ts
// v3
z.nativeEnum(MyEnum);

// v4 — z.enum() now accepts native enums and const objects
z.enum(MyEnum);

// v3: .Enum, .Values
// v4: .enum (lowercase)
```

## Function Schemas

```ts
// v3
z.function().args(z.string()).returns(z.number());

// v4 — no longer a schema, uses object config
z.function({ input: [z.string()], output: z.number() });
```

## Refinements

```ts
// v3: type predicates narrowed the output type
z.unknown().refine((val): val is string => typeof val === "string");

// v4: type predicates are ignored — use z.custom() instead
z.custom<string>((val) => typeof val === "string");
```

## Internals

```ts
// v3
schema._def;

// v4
schema._zod.def;

// v3 removed types:
// ZodEffects → refinements now embedded in schemas, transforms in ZodTransform
// ZodBranded → .brand() returns original type, no wrapper
// ZodPreprocess → use z.preprocess() or .pipe()

// v3: ZodTypeAny
// v4: just ZodType (no generic args needed)
```

## Promise

```ts
// v3
z.promise(z.string());

// v4: z.promise() deprecated — just use native Promise types
```

## Array nonempty

```ts
// v3: inferred [T, ...T[]]
z.array(z.string()).nonempty();

// v4: infers T[] with min(1) check (no tuple inference)
z.array(z.string()).min(1);
```

<!--
Source references:
- https://github.com/colinhacks/zod/blob/main/packages/docs/content/v4/changelog.mdx
- https://github.com/colinhacks/zod/blob/main/packages/docs/content/v4/index.mdx
-->
