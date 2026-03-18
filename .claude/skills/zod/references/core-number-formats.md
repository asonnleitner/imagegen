---
name: core-number-formats
description: Zod number and bigint types, validations, and integer format types
---

# Number Formats

Number and bigint validation in Zod 4. Numbers are finite-only by default (no NaN or Infinity).

## Number Validations

```ts
const n = z.number();

n.gt(5);          // > 5
n.gte(5);         // >= 5 (alias: .min(5))
n.lt(10);         // < 10
n.lte(10);        // <= 10 (alias: .max(10))
n.positive();     // > 0
n.negative();     // < 0
n.nonnegative();  // >= 0
n.nonpositive();  // <= 0
n.multipleOf(3);  // alias: .step(3)
```

## Number Format Types

Top-level functions for specific numeric ranges:

```ts
z.int();      // safe integer (-2^53+1 to 2^53-1)
z.int32();    // 32-bit signed integer (-2^31 to 2^31-1)
z.uint32();   // 32-bit unsigned integer (0 to 2^32-1)
z.float32();  // 32-bit float range
z.float64();  // 64-bit float (same as z.number())
```

## BigInt

```ts
z.bigint();

// same validation methods as number
z.bigint().gt(5n);
z.bigint().gte(5n);
z.bigint().lt(10n);
z.bigint().positive();
z.bigint().negative();
z.bigint().multipleOf(3n);
```

## BigInt Format Types

```ts
z.int64();   // 64-bit signed integer (-2^63 to 2^63-1)
z.uint64();  // 64-bit unsigned integer (0 to 2^64-1)
```

## Key Points

- `z.number()` rejects `NaN` and `Infinity` (changed from v3)
- `z.int()` validates safe integers only (equivalent to v3's `.safe()`)
- Number format types are standalone schemas, not methods on `z.number()`
- BigInt formats (`z.int64()`, `z.uint64()`) are not representable in JSON Schema

<!--
Source references:
- https://github.com/colinhacks/zod/blob/main/packages/docs/content/api.mdx
-->
