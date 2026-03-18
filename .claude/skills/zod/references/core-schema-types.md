---
name: core-schema-types
description: Zod primitive types, literals, enums, coercion, parsing, and type inference
---

# Schema Types

Core schema types, parsing methods, and type inference in Zod 4.

## Primitives

```ts
import * as z from "zod";

z.string();
z.number();      // finite only — no NaN or Infinity
z.bigint();
z.boolean();
z.date();        // validates Date instances
z.symbol();
z.undefined();
z.null();
z.void();        // accepts undefined
z.any();
z.unknown();
z.never();
z.nan();
```

## Literals

```ts
z.literal("tuna");
z.literal(42);
z.literal(true);

// multiple values (acts as union of literals)
z.literal(["red", "green", "blue"]);

// access values
const lit = z.literal(["red", "green", "blue"]);
lit.values; // Set {"red", "green", "blue"}
```

## Enums

```ts
// string enum
const Color = z.enum(["red", "green", "blue"]);
type Color = z.infer<typeof Color>; // "red" | "green" | "blue"

// access values
Color.enum.red; // "red"
Color.options;  // ["red", "green", "blue"]

// extract/exclude
Color.extract(["red", "green"]); // z.enum(["red", "green"])
Color.exclude(["blue"]);         // z.enum(["red", "green"])

// native TypeScript enum (replaces z.nativeEnum from v3)
enum Fruit { Apple, Banana }
z.enum(Fruit);

// const object
const STATUS = { Active: "active", Inactive: "inactive" } as const;
z.enum(STATUS);
```

## Coercion

Coerces input using JavaScript's built-in constructors before validation.

```ts
z.coerce.string();  // String(input)
z.coerce.number();  // Number(input)
z.coerce.boolean(); // Boolean(input)
z.coerce.bigint();  // BigInt(input)
z.coerce.date();    // new Date(input)

// input type is `unknown` by default
// restrict with generic:
z.coerce.number<number>(); // only accepts number input
```

## Stringbool

Converts string representations to boolean. Useful for environment variables.

```ts
z.stringbool();
// truthy: "true", "yes", "on", "1", "enabled", "t", "y"
// falsy:  "false", "no", "off", "0", "disabled", "f", "n"

// custom values
z.stringbool({
  truthy: ["yes", "1"],
  falsy: ["no", "0"],
  caseSensitive: true,
});
```

## Custom Types

```ts
z.custom<MyType>((val) => val instanceof MyType);
```

## Parsing

```ts
const schema = z.string();

// throws ZodError on failure, returns deep clone
schema.parse("hello");

// returns discriminated union — no try/catch needed
const result = schema.safeParse("hello");
if (result.success) {
  result.data; // string
} else {
  result.error; // ZodError
}

// async (required for async refinements/transforms)
await schema.parseAsync(data);
await schema.safeParseAsync(data);
```

## Type Inference

```ts
const User = z.object({ name: z.string(), age: z.number() });

type User = z.infer<typeof User>;
// { name: string; age: number }

// input vs output types (differ with transforms)
type UserInput = z.input<typeof User>;
type UserOutput = z.output<typeof User>; // same as z.infer
```

## Optionals, Nullables, Nullish

```ts
z.optional(z.string());   // string | undefined
z.nullable(z.string());   // string | null
z.nullish(z.string());    // string | null | undefined

// method syntax
z.string().optional();
z.string().nullable();
z.string().nullish();

// unwrap
z.string().optional().unwrap(); // z.string()

// remove optionality
z.string().optional().nonoptional(); // z.string()
```

## Defaults and Catch

```ts
// default: short-circuits on undefined (returns default directly, not parsed)
z.string().default("hello");

// prefault: passes default through parser (old v3 .default() behavior)
z.string().trim().prefault("  hello  "); // "hello" after trim

// catch: returns fallback on any validation error
z.string().catch("fallback");
```

## Branded Types

```ts
const UserId = z.string().brand<"UserId">();
type UserId = z.infer<typeof UserId>; // string & { __brand: "UserId" }

// brand direction
z.string().brand<"Tag">("out");   // output only (default)
z.string().brand<"Tag">("in");    // input only
z.string().brand<"Tag">("inout"); // both
```

## Readonly

```ts
z.object({ name: z.string() }).readonly();
// output is Readonly<{ name: string }>, frozen with Object.freeze()
```

## JSON

```ts
z.json(); // validates any JSON-encodable value
```

## Template Literals

```ts
z.templateLiteral(["hello, ", z.string()]);
// type: `hello, ${string}`

z.templateLiteral(["user-", z.number()]);
// type: `user-${number}`
```

<!--
Source references:
- https://github.com/colinhacks/zod/blob/main/packages/docs/content/basics.mdx
- https://github.com/colinhacks/zod/blob/main/packages/docs/content/api.mdx
-->
