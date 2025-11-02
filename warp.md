# json-schema-form

A headless UI form library powered by JSON Schemas that transforms JSON schemas into JavaScript `fields` to be easily consumed by UI libraries.

## Project Overview

**Package**: `@remoteoss/json-schema-form`  
**Version**: 1.2.2  
**License**: MIT  
**Maintained by**: Remote.com

This is a TypeScript library that provides:
- Headless form generation from JSON schemas
- Field validation using JSON Schema specification
- Support for conditional logic and computed values
- Extensible validation system
- Framework-agnostic form handling

## Core Architecture (src/)

### Main Entry Points

- **`src/index.ts`** - Main exports: `createHeadlessForm`, types, and utilities
- **`src/form.ts`** - Core form creation and validation logic
- **`src/types.ts`** - TypeScript definitions for schemas and values

### Key Components

#### Form Creation (`src/form.ts`)
- `createHeadlessForm()` - Main function to create a headless form from a JSON schema
- Handles validation, error transformation, and field generation
- Supports custom JSON Logic operations and legacy v0 compatibility

#### Field System (`src/field/`)
- **`type.ts`** - Field type definitions and interfaces
- **`schema.ts`** - Field schema building logic
- Converts JSON schemas into UI-consumable field objects

#### Validation System (`src/validation/`)
- **`schema.ts`** - Main schema validation engine
- **`array.ts`** - Array-specific validation
- **`object.ts`** - Object validation logic
- **`composition.ts`** - allOf/anyOf/oneOf validation
- **`conditions.ts`** - Conditional schema validation (if/then/else)
- **`json-logic.ts`** - JSON Logic rule evaluation
- **`format.ts`** - String format validation
- **`number.ts`** - Number validation
- **`enum.ts`** - Enum validation
- **`const.ts`** - Const validation
- **`file.ts`** - File validation

#### Schema Mutation (`src/mutations.ts`)
- `calculateFinalSchema()` - Applies conditional logic and computed values to schemas
- `updateFieldProperties()` - Updates field properties based on schema changes
- Handles dynamic form behavior based on user input

#### Utilities
- **`src/utils.ts`** - Common utility functions
- **`src/modify-schema.ts`** - Schema modification utilities
- **`src/errors/`** - Error handling and message generation
- **`src/custom/`** - Custom field ordering logic

## Field Types Supported

The library supports these input types:
- `text`, `textarea`, `email`, `hidden`
- `number`, `money`
- `select`, `radio`, `checkbox`
- `date`, `file`
- `fieldset`, `group-array`
- `country`

## JSON Schema Extensions

The library extends standard JSON Schema with custom properties:

- `x-jsf-presentation` - UI presentation hints (inputType, description, etc.)
- `x-jsf-order` - Field ordering
- `x-jsf-errorMessage` - Custom error messages
- `x-jsf-logic` - JSON Logic rules for validations and computed values
- `x-jsf-logic-validations` - References to validation rules
- `x-jsf-logic-computedAttrs` - Computed attributes

## Key Features

### Conditional Logic
- Supports JSON Schema `if/then/else` conditions
- Custom JSON Logic operations for complex rules
- Dynamic field visibility and validation

### Validation
- Full JSON Schema Draft 2020-12 support
- Custom validation messages
- Composition validation (allOf, anyOf, oneOf)
- Type-specific validators

### Legacy Support
- v0 compatibility mode via `legacyOptions`
- Graceful migration path from previous versions

## Development Commands

```bash
# Build the library
pnpm build

# Development mode with watch
pnpm dev

# Run tests
pnpm test
pnpm test:watch

# Linting and type checking
pnpm lint
pnpm typecheck
pnpm check

# Release
pnpm release:dev
pnpm release:beta
pnpm release
```

## Usage Example

```typescript
import { createHeadlessForm } from '@remoteoss/json-schema-form'

const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      'x-jsf-presentation': { inputType: 'text' }
    },
    email: {
      type: 'string',
      format: 'email',
      'x-jsf-presentation': { inputType: 'email' }
    }
  },
  required: ['name']
}

const form = createHeadlessForm(schema, {
  initialValues: { name: 'John' },
  strictInputType: true
})

// form.fields contains the generated field definitions
// form.handleValidation() validates form values
```

## Dependencies

**Runtime**:
- `json-logic-js` - JSON Logic rule evaluation

**Development**:
- TypeScript 5.7+ with strict configuration
- Jest for testing
- ESLint for code quality
- tsup for building

## Project Structure

```
src/
├── index.ts                 # Main exports
├── form.ts                  # Core form logic
├── types.ts                 # Type definitions
├── mutations.ts             # Schema mutations
├── utils.ts                 # Utilities
├── modify-schema.ts         # Schema modification
├── field/
│   ├── schema.ts           # Field schema building
│   └── type.ts             # Field type definitions
├── validation/
│   ├── schema.ts           # Main validation engine
│   ├── array.ts            # Array validation
│   ├── object.ts           # Object validation
│   ├── composition.ts      # Composition validation
│   ├── conditions.ts       # Conditional validation
│   ├── json-logic.ts       # JSON Logic integration
│   └── [other validators]
├── errors/
│   ├── index.ts            # Error types
│   └── messages.ts         # Error messages
└── custom/
    └── order.ts            # Custom ordering
```

This is a mature, production-ready library used to bridge JSON Schema specifications with UI form implementations across different frameworks.