# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Package**: `@laus/json-schema-form`
**Description**: A headless UI form library powered by JSON Schemas that transforms JSON schemas into JavaScript `fields` to be easily consumed by UI libraries.
**Language**: TypeScript (ESM-only)
**Maintained by**: laus

This library provides framework-agnostic form handling with validation, conditional logic, and computed values based on JSON Schema specifications.

> **This is a fork of [`remoteoss/json-schema-form`](https://github.com/remoteoss/json-schema-form)** that adds three fork-only features: i18n validation messages (`en`/`es`), async-loaded select options, and a responsive CSS-grid layout system. The `v0/` legacy tree was removed. **Before adding features or syncing with upstream, read `MAINTAINING.md`** — it defines the discipline that keeps merge conflicts small (fork code lives in fork-only files; core files get a minimal `// [fork]` hook).

## Development Setup

This project **requires**:
- Node.js LTS v22.13.1 (see `.nvmrc`)
- pnpm package manager (v9.15.2+)

```bash
# Clone with submodules (includes json-schema-test-suite)
git clone https://github.com/DaikonCOde/json-schema-form.git --recursive

# If already cloned without submodules
git submodule update --init

# Install dependencies (must use pnpm)
pnpm install
```

## Essential Commands

### Building & Development
```bash
pnpm build              # Build library with tsup
pnpm dev                # Development mode with watch (rebuilds on changes)
```

### Testing
```bash
pnpm test               # Run all tests (including JSON Schema Test Suite)
pnpm test:watch         # Run tests in watch mode
pnpm test:file <path>   # Run a single test file with watch mode
pnpm typecheck          # TypeScript type checking
pnpm lint               # ESLint code quality checks
pnpm check              # Run both lint and typecheck
```

### Testing Local Changes (yalc)
`dist/` is **git-ignored** (not versioned); it is rebuilt on install via the `prepare` script. To test changes in a consumer project:
1. In the consumer, link once: `yalc add @laus/json-schema-form`
2. Manual push: `pnpm build && yalc push`
3. Or watch mode: `pnpm dev:yalc` — rebuilds `dist/` on change and auto-runs `yalc push`

### Publishing (Maintainers Only)
```bash
pnpm release:dev        # Publish dev release (tagged as 'dev')
pnpm release:beta       # Publish beta release
pnpm release            # Publish official release
```

## Architecture Overview

### Core Entry Point
- **`src/index.ts`**: Main exports - `createHeadlessForm`, types, utilities, and layout helpers
- **`src/form.ts`**: Core form creation logic, validation orchestration, error transformation

### Key Architectural Concepts

#### 1. Headless Form Pattern
The library doesn't render UI - it transforms JSON schemas into `Field` objects that UI frameworks consume. Each field contains metadata about type, validation, presentation hints, and conditional logic.

#### 2. Schema to Fields Pipeline
```
JSON Schema → calculateFinalSchema() → buildFieldSchema() → Field[]
                  (mutations.ts)         (field/schema.ts)
```

#### 3. Validation System (`src/validation/`)
Modular validators for different JSON Schema keywords:
- **`schema.ts`**: Main validation orchestrator
- **`object.ts`**: Object properties, required fields, additionalProperties
- **`array.ts`**: Array items, minItems, maxItems, uniqueItems
- **`composition.ts`**: allOf/anyOf/oneOf combinators
- **`conditions.ts`**: if/then/else conditional schemas
- **`json-logic.ts`**: JSON Logic rule evaluation and custom operations
- Type-specific: `string.ts`, `number.ts`, `format.ts`, `enum.ts`, `const.ts`, `file.ts`

#### 4. Schema Mutations (`src/mutations.ts`)
Dynamic schema transformation based on form state:
- **`calculateFinalSchema()`**: Applies conditional logic and computed values to schemas
- **`updateFieldProperties()`**: Updates field properties when schema changes
- Enables dynamic forms where fields appear/disappear based on user input

#### 5. Custom JSON Schema Extensions
The library extends JSON Schema with `x-jsf-*` properties:
- `x-jsf-presentation`: UI hints (inputType, description, placeholder, unit, `asyncOptions`, etc.)
- `x-jsf-order`: Field ordering in UI
- `x-jsf-layout`: **[fork]** Responsive column/grid layout config
- `x-jsf-errorMessage`: Custom validation error messages per rule
- `x-jsf-logic`: JSON Logic rules for validations and computed values
- `x-jsf-logic-validations`: References to validation rules
- `x-jsf-logic-computedAttrs`: Computed attributes

### Field Types Supported
- Text inputs: `text`, `textarea`, `email`, `hidden`
- Numeric: `number`, `money`
- Selection: `select`, `radio`, `checkbox`, `autocomplete`
- Other: `date`, `file`, `country`
- Structural: `fieldset`, `group-array`

### Layout System (`src/utils/layout.ts`) — [fork]
Provides responsive CSS Grid-based layout generation for forms:
- `generateCSSGridProperties()`: Generates CSS Grid styles
- `getFormContainerLayout()`: Root container layout configuration
- `getFieldLayoutInfo()`: Individual field layout metadata
- Support for responsive breakpoints and column spans

### i18n / Validation Messages (`src/i18n/`) — [fork]
Built-in validation error messages are localized. `src/i18n/index.ts` holds the
per-locale message tables (`en` default, `es`) and `getTable()`. `src/errors/messages.ts`
keeps only `getErrorMessage()`, which reads the table for `options.locale`. Add a
language = add one table + extend the `Locale` union. Nothing else changes.

### Async Options (`asyncLoaders`) — [fork]
Select fields can load options asynchronously: declare `x-jsf-presentation.asyncOptions`
in the schema and map its `id` to a loader in `options.asyncLoaders`. Async/layout types
live in `src/types-ext.ts` (fork-only), re-exported from `src/types.ts`. Loading logic is
threaded through `src/field/schema.ts` and `src/form.ts`.

### Fork-only modules (keep fork code here, not in core files)
- `src/i18n/` — locale message tables
- `src/types-ext.ts` — async-options + layout types
- `src/utils/layout.ts` — layout utilities
- `test/async-options.test.ts` — async-options tests

See `MAINTAINING.md` for the full fork/upstream contact map and sync workflow.

## Testing Philosophy

1. **JSON Schema Test Suite**: The `json-schema-test-suite` submodule provides official JSON Schema compliance tests (requires `git submodule update --init`)
2. **V0 Compatibility**: The `legacyOptions` API is preserved for backward compatibility (the `v0/` source tree itself was removed in this fork)
3. **Test Organization**: Tests mirror `src/` structure in `test/` directory. Fork features have their own files (`test/async-options.test.ts`, i18n cases in `test/errors/messages.test.ts`)

## Legacy Support

The library maintains backward compatibility with v0 through `legacyOptions`:
- `treatNullAsUndefined`: Treat null values as undefined (v0 bug behavior)
- `allowForbiddenValues`: Allow values against schema `false` (v0 bug behavior)

Note: the `v0/` source directory was removed in this fork; only the `legacyOptions` API remains.

## Important Development Notes

### TypeScript Configuration
- Uses strict mode with ES2022 target
- ESM-only (no CommonJS)
- Module resolution: `bundler`

### Code Quality
- ESLint with @antfu/eslint-config
- No warnings allowed (`--max-warnings 0`)
- Prettier for formatting

### Error Handling
Error paths are transformed to match the data structure (see `transformErrorPath()` in `form.ts`):
- Removes JSON Schema composition keywords (allOf/anyOf/oneOf)
- Removes conditional keywords (then/else)
- Converts array paths by removing "items" but keeping indices

### Commit Conventions
Follow Conventional Commits for commit messages:
```
feat(parser): add ability to parse arrays
fix(validation): correct null handling in schema
```

## Key Files Reference

- **`src/form.ts`**: `createHeadlessForm()` - main API entry point
- **`src/types.ts`**: Core TypeScript type definitions
- **`src/field/schema.ts`**: Field schema building from JSON schemas
- **`src/field/type.ts`**: Field type definitions and interfaces
- **`src/validation/schema.ts`**: Main validation engine
- **`src/mutations.ts`**: Dynamic schema transformation logic
- **`src/modify-schema.ts`**: Schema modification utilities (`modify()` function)
- **`src/errors/messages.ts`**: Error message generation (reads locale tables via `getErrorMessage()`)
- **`src/i18n/index.ts`**: [fork] Locale message tables + `getTable()`
- **`src/types-ext.ts`**: [fork] Async-options + layout type definitions

## Documentation

- **`MAINTAINING.md`**: Fork/upstream sync workflow + contact map (read before syncing or adding features)
- **`llms.txt`**: Full public API reference for AI agents consuming the library (ships in the package)
- **`AGENTS.md`**: How-to-implement rules for AI agents consuming the library (ships in the package)
- Migration guide: See `MIGRATING.md` for v0→v1 migration details
- JSON Schema reference: See `SCHEMA.md`
- Examples: See `EXAMPLES.md`
- Async select feature: See `docs/ASYNC_SELECT.md` and `docs/ASYNC_SELECT_QUICK_START.md`
- Layout system: See `docs/LAYOUT_USAGE.md`
- Upstream live docs (remoteoss): https://json-schema-form.vercel.app/
