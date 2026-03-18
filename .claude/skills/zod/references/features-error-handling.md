---
name: features-error-handling
description: Zod error customization, formatting, pretty-printing, and i18n
---

# Error Handling

Error customization, formatting, and internationalization in Zod 4.

## Error Customization

Unified `error` parameter replaces v3's `message`, `errorMap`, `invalid_type_error`, `required_error`.

### Schema-Level Errors

```ts
// simple string message
z.string("Not a string!");
z.string({ error: "Not a string!" });

// error map function
z.string({
  error: (iss) => {
    if (iss.input === undefined) return "Required";
    return "Must be a string";
  },
});

// error map receives context
z.number({
  error: (iss) => {
    // iss.code    — issue code
    // iss.input   — the invalid input value
    // iss.inst    — the schema instance
    // iss.path    — the path to the issue
    return `Expected number, got ${typeof iss.input}`;
  },
});
```

### Per-Parse Errors

Lower precedence than schema-level:

```ts
schema.parse(data, {
  error: (iss) => `Validation failed: ${iss.code}`,
});

// include input data in error issues
schema.parse(data, { reportInput: true });
```

### Global Errors

Lowest precedence:

```ts
z.config({
  customError: (iss) => `Global error: ${iss.code}`,
});
```

### Precedence Order

1. Schema-level `error` (highest)
2. Per-parse `error`
3. Global `customError`
4. Locale error map (lowest)

## Error Formatting

### Tree Format

```ts
const result = schema.safeParse(data);
if (!result.success) {
  const tree = z.treeifyError(result.error);
  tree.errors;          // string[] — top-level errors
  tree.properties?.name?.errors; // nested field errors
  tree.items?.[0]?.errors;      // array element errors
}
```

### Pretty Print

```ts
z.prettifyError(result.error);
// Returns human-readable multi-line string:
// ✖ Expected string, received number at "name"
// ✖ Required at "email"
```

### Flat Format

For simple form validation:

```ts
const flat = z.flattenError(result.error);
flat.formErrors;    // string[] — top-level errors
flat.fieldErrors;   // { [field]: string[] } — per-field errors
```

## Internationalization

40+ locales available. English loaded by default in Zod (not in Zod Mini).

```ts
import * as z from "zod";

// load a locale
z.config(z.locales.en());
z.config(z.locales.fr());
z.config(z.locales.de());
z.config(z.locales.ja());

// dynamic import
const locale = await import("zod/locales/fr");
z.config(locale);
```

## Key Points

- Use `error` parameter everywhere (replaces v3's `message`, `errorMap`)
- Error maps can return `undefined` to defer to the next level
- `z.treeifyError()` replaces deprecated `.format()`
- `z.flattenError()` replaces deprecated `.flatten()`
- `z.prettifyError()` is useful for logging and debugging
- Zod Mini does not load any locale by default — must load manually

<!--
Source references:
- https://github.com/colinhacks/zod/blob/main/packages/docs/content/error-customization.mdx
- https://github.com/colinhacks/zod/blob/main/packages/docs/content/error-formatting.mdx
-->
