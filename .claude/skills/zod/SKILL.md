---
name: zod
description: Zod schema validation library - TypeScript-first schema declaration and validation
metadata:
  author: Andreas Sonnleitner
  version: "2026.3.10"
  source: Generated from https://github.com/colinhacks/zod, scripts located at https://github.com/asonnleitner/skills
---

> The skill is based on Zod v4.3.6, generated at 2026-03-10.

Zod is a TypeScript-first schema declaration and validation library. It provides zero-dependency, immutable schema definitions with full type inference. Zod 4 brings major performance improvements (14x faster string parsing, 7x faster arrays, 6.5x faster objects), a tree-shakable Mini variant, first-party JSON Schema support, bidirectional codecs, metadata registries, and 40+ i18n locales.

## Core References

| Topic | Description | Reference |
|-------|-------------|-----------|
| Schema Types | Primitives, literals, enums, coercion, parsing, type inference | [core-schema-types](references/core-schema-types.md) |
| String Formats | Email, UUID, URL, IP, datetime, and other string format validators | [core-string-formats](references/core-string-formats.md) |
| Number Formats | Number and bigint types, validations, and integer formats | [core-number-formats](references/core-number-formats.md) |
| Objects | Object schemas, strict/loose, recursive, extend, pick, omit, partial | [core-objects](references/core-objects.md) |
| Collections | Arrays, tuples, records, maps, sets, files, unions, intersections | [core-collections](references/core-collections.md) |

## Features

| Topic | Description | Reference |
|-------|-------------|-----------|
| Transforms & Codecs | Unidirectional transforms, pipes, bidirectional codecs, preprocess | [features-transforms-codecs](references/features-transforms-codecs.md) |
| Refinements | Custom validation with refine, superRefine, check, overwrite | [features-refinements](references/features-refinements.md) |
| Error Handling | Error customization, formatting, pretty-printing, i18n | [features-error-handling](references/features-error-handling.md) |
| JSON Schema | Convert Zod schemas to/from JSON Schema | [features-json-schema](references/features-json-schema.md) |
| Metadata & Registries | Typed metadata system, registries, global registry | [features-metadata-registries](references/features-metadata-registries.md) |

## Advanced

| Topic | Description | Reference |
|-------|-------------|-----------|
| Zod Mini | Tree-shakable variant with functional API (64% smaller) | [advanced-zod-mini](references/advanced-zod-mini.md) |
| Library Authors | Building libraries on top of Zod, Standard Schema, peer deps | [advanced-library-authors](references/advanced-library-authors.md) |
| Migration v3 to v4 | Breaking changes and migration patterns from Zod 3 to Zod 4 | [advanced-migration-v3-v4](references/advanced-migration-v3-v4.md) |
