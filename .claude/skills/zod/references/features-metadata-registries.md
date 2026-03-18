---
name: features-metadata-registries
description: Zod metadata system, registries, and global registry
---

# Metadata & Registries

Strongly-typed metadata system for associating schemas with additional information.

## Registries

A registry is a strongly-typed collection mapping schemas to metadata:

```ts
import * as z from "zod";

// create a registry with metadata type
const myRegistry = z.registry<{ description: string; deprecated?: boolean }>();

const Name = z.string();

// add metadata
myRegistry.add(Name, { description: "User's full name" });

// query metadata
myRegistry.has(Name);    // true
myRegistry.get(Name);    // { description: "User's full name" }
myRegistry.remove(Name);
myRegistry.clear();
```

## Inline Registration

`.register()` returns the original schema (not a new instance):

```ts
const Email = z.email().register(myRegistry, {
  description: "User email",
});
// Email is the same schema instance, now registered
```

## Global Registry

Built-in registry with common metadata fields:

```ts
// set metadata via .meta()
const Name = z.string().meta({
  id: "user-name",
  title: "User Name",
  description: "The user's display name",
  deprecated: true,
  examples: ["Alice", "Bob"],
});

// retrieve metadata
Name.meta(); // { id: "user-name", title: "User Name", ... }

// .describe() shorthand
z.string().describe("A short description");
// equivalent to z.string().meta({ description: "A short description" })
```

### Augmenting Global Registry

Add custom fields via TypeScript declaration merging:

```ts
declare module "zod" {
  interface GlobalMeta {
    label?: string;
    placeholder?: string;
  }
}

// now you can use custom fields
z.string().meta({ label: "Name", placeholder: "Enter name" });
```

## Using Inferred Types in Metadata

Reference schema types in registry metadata:

```ts
const defaults = z.registry<{ default: z.$output }>();

const Age = z.number().register(defaults, { default: 25 }); // typed as number
const Name = z.string().register(defaults, { default: "Anonymous" }); // typed as string
```

## Constrained Registries

Limit which schema types a registry accepts:

```ts
// only accepts string schemas
const stringMeta = z.registry<{ pattern: string }, z.ZodString>();

stringMeta.add(z.string(), { pattern: "^[a-z]+$" }); // OK
// stringMeta.add(z.number(), { ... }); // TS error
```

## Key Points

- `.meta()` returns a new schema instance with metadata attached
- `.register()` returns the *same* schema instance (not a copy)
- `z.globalRegistry` accepts `id`, `title`, `description`, `deprecated`, and custom fields
- The `id` property in a registry enforces uniqueness
- Use registries for JSON Schema generation, form metadata, or documentation

<!--
Source references:
- https://github.com/colinhacks/zod/blob/main/packages/docs/content/metadata.mdx
-->
