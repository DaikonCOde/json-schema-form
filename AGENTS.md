# AGENTS.md — @laus/json-schema-form

Guidance for AI agents (Claude, Cursor, Copilot, …) writing code that **consumes** this library.

**Full API reference: [`llms.txt`](./llms.txt).** Read it before generating non-trivial code.

## What this library is (and is NOT)

- It is a **headless** form engine: JSON Schema in → `Field[]` + `handleValidation` out.
- It renders **no UI**. There are no components, no `<Form>`, no hooks. You render the `fields` yourself with whatever framework the host project uses.
- It is **ESM-only**. Do not generate `require()` calls.

## The one pattern you almost always want

```ts
import { createHeadlessForm } from '@laus/json-schema-form'

const { fields, handleValidation } = createHeadlessForm(schema, options)
// 1. Map `fields` to inputs (recurse into field.fields for fieldset / group-array).
// 2. On submit/change: const { formErrors } = handleValidation(values)
// 3. Show formErrors[field.name] next to each input.
```

## Rules

1. **Do NOT hand-roll validation.** Always validate through `handleValidation`. It respects conditionals, JSON Logic, computed values, and locale.
2. **UI hints go in `x-jsf-presentation`**, not invented top-level keys. `inputType` there selects the `FieldType`.
3. **Custom error text** goes in `x-jsf-errorMessage` (keyed by validation type, e.g. `{ required: '...', minLength: '...' }`). It overrides the locale.
4. **Field ordering** is `x-jsf-order` on the schema, or `modify(..., { orderRoot })` — never reorder `fields` by hand.
5. **To transform a schema** (add/edit/pick/reorder fields) use `modify()`; it returns a new schema — pass THAT to `createHeadlessForm`.
6. **`handleValidation` has side effects** (recomputes conditional schema, updates field props). Call it; don't cache its schema assumptions.
7. `fields` is already flat/nested per the schema; render `field.isVisible` and recurse `field.fields`.

## Fork-only features (not in upstream @remoteoss)

- **i18n**: `createHeadlessForm(schema, { locale: 'es' })` → Spanish messages. Default `'en'`.
- **Async selects**: `x-jsf-presentation.asyncOptions = { id, searchable?, paginated?, dependencies? }` + `options.asyncLoaders = { [id]: async (ctx) => ({ options, pagination? }) }`. The resolved field exposes `field.asyncOptions.loader`.
- **Layout**: `x-jsf-layout` on schema/field + the `generate*CSS` / `get*Layout` helpers for responsive CSS grid.

See `llms.txt` for exact signatures and copy-pasteable examples of each.

## Common mistakes to avoid

- ❌ Importing a component — there are none.
- ❌ Building error messages from `field` metadata manually — use `handleValidation`.
- ❌ Mutating the input schema — `modify()` returns a clone; use it.
- ❌ Assuming CJS / `require` — this is ESM-only.
- ❌ Passing `customProperties` — removed in v1 (logs a deprecation error).
