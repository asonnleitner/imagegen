---
name: core-objects
description: Zod object schemas — strict/loose modes, recursive objects, extend, pick, omit, partial
---

# Objects

Object schema definition and manipulation in Zod 4.

## Object Modes

```ts
// strips unknown keys (default)
z.object({ name: z.string() });

// errors on unknown keys (replaces .strict())
z.strictObject({ name: z.string() });

// passes through unknown keys (replaces .passthrough())
z.looseObject({ name: z.string() });
```

## Shape Access

```ts
const User = z.object({ name: z.string(), age: z.number() });

User.shape;      // { name: ZodString, age: ZodNumber }
User.shape.name; // ZodString
User.keyof();    // z.enum(["name", "age"])
```

## Extend

```ts
const Base = z.object({ id: z.string() });
const User = Base.extend({ name: z.string(), email: z.email() });

// .safeExtend() — type error if overriding existing keys
const Extended = Base.safeExtend({ name: z.string() }); // OK
// Base.safeExtend({ id: z.number() }); // TS error — key "id" already exists

// spread syntax (better tsc performance for large schemas)
const Merged = z.object({ ...Base.shape, ...User.shape });
```

## Pick & Omit

```ts
const User = z.object({ id: z.string(), name: z.string(), email: z.email() });

User.pick({ id: true, name: true });
// z.object({ id: z.string(), name: z.string() })

User.omit({ email: true });
// z.object({ id: z.string(), name: z.string() })
```

## Partial & Required

```ts
const User = z.object({ name: z.string(), age: z.number() });

// all fields optional
User.partial();
// { name?: string; age?: number }

// specific fields optional
User.partial({ name: true });
// { name?: string; age: number }

// make optional fields required
User.partial().required();
// { name: string; age: number }
```

## Catchall

Accept unknown keys with a specific value type:

```ts
z.object({ name: z.string() }).catchall(z.number());
// { name: string; [k: string]: number }
```

## Recursive Objects

Use getters for self-referencing schemas:

```ts
const Category = z.object({
  name: z.string(),
  get subcategories() {
    return z.array(Category);
  },
});

type Category = z.infer<typeof Category>;
// { name: string; subcategories: Category[] }
```

Mutual recursion:

```ts
const User = z.object({
  name: z.string(),
  get posts() { return z.array(Post); },
});

const Post = z.object({
  title: z.string(),
  get author() { return User; },
});
```

For complex recursive types, add a type annotation on the getter:

```ts
const Category = z.object({
  name: z.string(),
  get subcategories(): z.ZodArray<typeof Category> {
    return z.array(Category);
  },
});
```

## Key Points

- `.strict()` and `.passthrough()` are deprecated — use `z.strictObject()` and `z.looseObject()`
- `.merge()` is deprecated — use `.extend()` or spread syntax
- `.deepPartial()` is removed in v4
- Defaults are applied within optional object fields
- Spread syntax `{ ...A.shape, ...B.shape }` is recommended over `.extend()` for performance with large schemas

<!--
Source references:
- https://github.com/colinhacks/zod/blob/main/packages/docs/content/api.mdx
-->
