# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Package**: `@remoteoss/json-schema-form`
**Description**: A headless UI form library powered by JSON Schemas that transforms JSON schemas into JavaScript `fields` to be easily consumed by UI libraries.
**Language**: TypeScript (ESM-only)
**Maintained by**: Remote.com

This library provides framework-agnostic form handling with validation, conditional logic, and computed values based on JSON Schema specifications.

## Development Setup

This project **requires**:
- Node.js LTS v22.13.1 (see `.nvmrc`)
- pnpm package manager (v9.15.2+)

```bash
# Clone with submodules (includes json-schema-test-suite)
git clone https://github.com/remoteoss/json-schema-form.git --recursive

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

### Testing Local Changes
To test changes in a consumer project:
1. Run `pnpm dev` to generate `dist/` folder with watch mode
2. Option A: Import directly from dist: `import { createHeadlessForm } from '../../path/to/json-schema-form/dist'`
3. Option B: Use `npm link` or `yarn link` to symlink the package

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
- `x-jsf-presentation`: UI hints (inputType, description, placeholder, unit, etc.)
- `x-jsf-order`: Field ordering in UI
- `x-jsf-errorMessage`: Custom validation error messages per rule
- `x-jsf-logic`: JSON Logic rules for validations and computed values
- `x-jsf-logic-validations`: References to validation rules
- `x-jsf-logic-computedAttrs`: Computed attributes

### Field Types Supported
- Text inputs: `text`, `textarea`, `email`, `hidden`
- Numeric: `number`, `money`
- Selection: `select`, `radio`, `checkbox`
- Other: `date`, `file`, `country`
- Structural: `fieldset`, `group-array`

### Layout System (`src/utils/layout.ts`)
Provides responsive CSS Grid-based layout generation for forms:
- `generateCSSGridProperties()`: Generates CSS Grid styles
- `getFormContainerLayout()`: Root container layout configuration
- `getFieldLayoutInfo()`: Individual field layout metadata
- Support for responsive breakpoints and column spans

## Testing Philosophy

1. **JSON Schema Test Suite**: The `json-schema-test-suite` submodule provides official JSON Schema compliance tests
2. **V0 Compatibility**: Tests from v0 are preserved to ensure backward compatibility via `legacyOptions`
3. **Test Organization**: Tests mirror `src/` structure in `test/` directory

## Legacy Support

The library maintains backward compatibility with v0 through `legacyOptions`:
- `treatNullAsUndefined`: Treat null values as undefined (v0 bug behavior)
- `allowForbiddenValues`: Allow values against schema `false` (v0 bug behavior)

v0 code still exists in the repo under `v0/` directory for reference during migration.

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
- **`src/errors/messages.ts`**: Error message generation

## Documentation

- Live docs: https://json-schema-form.vercel.app/
- Playground: https://json-schema-form.vercel.app/?path=/docs/playground--docs
- Migration guide: See `MIGRATING.md` for v0→v1 migration details
- Async select feature: See `docs/ASYNC_SELECT.md` and `docs/ASYNC_SELECT_QUICK_START.md`
- Layout system: See `docs/LAYOUT_USAGE.md`

Note: Documentation source code is not in this repo (still coupled to Remote's internal Design System).
