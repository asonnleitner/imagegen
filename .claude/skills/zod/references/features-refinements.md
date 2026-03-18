---
name: features-refinements
description: Custom validation with refine, superRefine, check, and overwrite
---

# Refinements

Custom validation logic in Zod 4. Refinements are embedded directly in schemas (no `ZodEffects` wrapper).

## `.refine()`

Add custom validation returning boolean:

```ts
z.string().refine((val) => val.length <= 255, {
  error: "String must be 255 characters or fewer",
});

// with abort — stop validation on failure
z.string().refine((val) => val.length > 0, {
  error: "Required",
  abort: true,  // prevents subsequent checks from running
});

// with path — assign error to nested path
z.object({ password: z.string(), confirm: z.string() })
  .refine((data) => data.password === data.confirm, {
    error: "Passwords don't match",
    path: ["confirm"],
  });

// conditional execution
z.object({ type: z.string(), value: z.string() })
  .refine((data) => data.value.length > 0, {
    when: { type: "required" }, // only runs when type === "required"
    error: "Value is required",
  });
```

## `.superRefine()`

Add multiple custom issues at once:

```ts
z.string().superRefine((val, ctx) => {
  if (val.length < 8) {
    ctx.addIssue({
      code: "too_small",
      minimum: 8,
      message: "Must be at least 8 characters",
    });
  }
  if (!/[A-Z]/.test(val)) {
    ctx.addIssue({
      code: "custom",
      message: "Must contain an uppercase letter",
    });
  }
});
```

## `.check()`

Low-level API pushing issues directly:

```ts
z.string().check((ctx) => {
  if (ctx.value.length < 5) {
    ctx.issues.push({
      code: "too_small",
      minimum: 5,
      input: ctx.value,
      origin: "string",
      message: "Too short",
    });
  }
});
```

## Async Refinements

Use with `.parseAsync()` or `.safeParseAsync()`:

```ts
z.string().refine(async (val) => {
  const exists = await checkDatabase(val);
  return !exists;
}, { error: "Already exists" });
```

## Key Points

- Refinements are embedded in schemas in v4 — no `ZodEffects` wrapper
- `.refine()` ignores type predicates (unlike v3)
- `abort: true` stops subsequent checks on failure
- `when` option enables conditional refinement execution
- `.superRefine()` can add multiple issues and abort early via `ctx.addIssue()`
- Async refinements require `.parseAsync()` or `.safeParseAsync()`

<!--
Source references:
- https://github.com/colinhacks/zod/blob/main/packages/docs/content/api.mdx
-->
