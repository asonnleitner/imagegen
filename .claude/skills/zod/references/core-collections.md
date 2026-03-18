---
name: core-collections
description: Zod arrays, tuples, records, maps, sets, files, unions, discriminated unions, intersections
---

# Collections & Compound Types

Arrays, tuples, records, maps, sets, files, unions, and intersections.

## Arrays

```ts
z.array(z.string());
// or
z.string().array();

// validations
z.array(z.string()).min(1);
z.array(z.string()).max(10);
z.array(z.string()).length(5);

// access element schema
z.array(z.string()).unwrap(); // z.string()
```

## Tuples

```ts
z.tuple([z.string(), z.number()]);
// [string, number]

// variadic rest element
z.tuple([z.string()], z.number());
// [string, ...number[]]
```

## Unions

```ts
// standard union — checks options in order, returns first match
z.union([z.string(), z.number()]);
// or
z.string().or(z.number());

// exclusive union (XOR) — exactly one option must match
z.xor([
  z.object({ type: z.literal("a"), a: z.string() }),
  z.object({ type: z.literal("b"), b: z.number() }),
]);
```

## Discriminated Unions

Uses a discriminator key for efficient O(1) parsing:

```ts
z.discriminatedUnion("type", [
  z.object({ type: z.literal("email"), email: z.email() }),
  z.object({ type: z.literal("phone"), phone: z.string() }),
]);

// supports nesting — inner discriminated unions work
z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("user"), name: z.string() }),
  z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("admin"), level: z.number() }),
    z.object({ kind: z.literal("super"), powers: z.array(z.string()) }),
  ]),
]);
```

## Intersections

```ts
z.intersection(
  z.object({ name: z.string() }),
  z.object({ age: z.number() }),
);
// { name: string } & { age: number }
```

## Records

```ts
// requires two arguments in v4 (key + value)
z.record(z.string(), z.number());
// Record<string, number>

// enum keys — exhaustive (all keys required)
z.record(z.enum(["a", "b"]), z.number());
// { a: number; b: number }

// partial record — enum keys are optional
z.partialRecord(z.enum(["a", "b"]), z.number());
// { a?: number; b?: number }

// loose record — passes through non-matching keys
z.looseRecord(z.string(), z.number());

// numeric keys (since v4.2)
z.record(z.number(), z.string());
```

## Maps

```ts
z.map(z.string(), z.number());
// Map<string, number>
```

## Sets

```ts
z.set(z.string());
// Set<string>

z.set(z.number()).min(1).max(10).size(5);
```

## Files

```ts
z.file();

z.file()
  .min(1024)           // minimum size in bytes
  .max(5 * 1024 * 1024) // maximum size in bytes
  .mime(["image/png", "image/jpeg"]);
```

## Key Points

- `z.record()` requires two arguments in v4 (was optional key in v3)
- Enum-keyed records are exhaustive — use `z.partialRecord()` for optional keys
- `z.array().nonempty()` no longer infers `[T, ...T[]]` — just `T[]` with min(1)
- Discriminated unions support nesting and more schema types than v3
- `z.xor()` is new in v4 — use when exactly one option should match

<!--
Source references:
- https://github.com/colinhacks/zod/blob/main/packages/docs/content/api.mdx
-->
