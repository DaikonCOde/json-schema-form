# JSON Schema Reference Guide

Complete reference for all supported JSON Schema keywords, custom extensions, and field types in `@laus/json-schema-form`.

## Table of Contents

- [Standard JSON Schema Keywords](#standard-json-schema-keywords)
  - [Type System](#type-system)
  - [String Validation](#string-validation)
  - [Number Validation](#number-validation)
  - [Object Structure](#object-structure)
  - [Array Structure](#array-structure)
  - [Schema Composition](#schema-composition)
  - [Conditional Logic](#conditional-logic)
  - [Metadata](#metadata)
- [Custom x-jsf-* Extensions](#custom-x-jsf--extensions)
  - [x-jsf-presentation](#x-jsf-presentation)
  - [x-jsf-order](#x-jsf-order)
  - [x-jsf-errorMessage](#x-jsf-errormessage)
  - [x-jsf-layout](#x-jsf-layout)
  - [x-jsf-logic](#x-jsf-logic)
  - [x-jsf-logic-validations](#x-jsf-logic-validations)
  - [x-jsf-logic-computedAttrs](#x-jsf-logic-computedattrs)
- [Supported String Formats](#supported-string-formats)
- [Input Types](#input-types)
- [Field Structure](#field-structure)
- [JSON Logic Operations](#json-logic-operations)
- [Async Options](#async-options)
- [Validation Error Types](#validation-error-types)

---

## Standard JSON Schema Keywords

This library supports JSON Schema 2020-12 specification with the following keywords:

### Type System

#### `type`
Specifies the data type of the value.

**Supported types:**
- `"string"` - Text values
- `"number"` - Numeric values (integers or decimals)
- `"integer"` - Integer values only
- `"boolean"` - True or false
- `"object"` - Nested objects
- `"array"` - Arrays/lists
- `"null"` - Null value

**Can also be an array of types:**
```json
{
  "type": ["string", "null"]
}
```

#### `enum`
Restricts value to one of predefined options.

```json
{
  "type": "string",
  "enum": ["small", "medium", "large"]
}
```

#### `const`
Value must equal a specific constant.

```json
{
  "type": "string",
  "const": "fixed-value"
}
```

---

### String Validation

#### `minLength`
Minimum number of characters (uses Unicode grapheme segmentation).

```json
{
  "type": "string",
  "minLength": 3
}
```

#### `maxLength`
Maximum number of characters.

```json
{
  "type": "string",
  "maxLength": 50
}
```

#### `pattern`
Regular expression pattern the string must match.

```json
{
  "type": "string",
  "pattern": "^[A-Z][a-z]+$"
}
```

#### `format`
Predefined format validation (see [Supported String Formats](#supported-string-formats)).

```json
{
  "type": "string",
  "format": "email"
}
```

---

### Number Validation

#### `minimum`
Minimum value (inclusive).

```json
{
  "type": "number",
  "minimum": 0
}
```

#### `maximum`
Maximum value (inclusive).

```json
{
  "type": "number",
  "maximum": 100
}
```

#### `exclusiveMinimum`
Minimum value (exclusive - value must be greater than this).

```json
{
  "type": "number",
  "exclusiveMinimum": 0
}
```

#### `exclusiveMaximum`
Maximum value (exclusive - value must be less than this).

```json
{
  "type": "number",
  "exclusiveMaximum": 100
}
```

#### `multipleOf`
Value must be a multiple of this number.

```json
{
  "type": "number",
  "multipleOf": 5
}
```

---

### Object Structure

#### `properties`
Defines the properties of an object.

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "number" }
  }
}
```

#### `required`
Array of required property names.

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "email": { "type": "string" }
  },
  "required": ["name", "email"]
}
```

#### `additionalProperties`
Controls whether additional properties are allowed. Can be boolean or a schema.

```json
{
  "type": "object",
  "properties": { "name": { "type": "string" } },
  "additionalProperties": false
}
```

```json
{
  "type": "object",
  "additionalProperties": { "type": "string" }
}
```

#### `patternProperties`
Regex-based property validation.

```json
{
  "type": "object",
  "patternProperties": {
    "^v[0-9]+$": { "type": "string" }
  }
}
```

---

### Array Structure

#### `items`
Schema that all array items must validate against.

```json
{
  "type": "array",
  "items": { "type": "string" }
}
```

#### `prefixItems`
Schema for specific positions in array (tuple validation).

```json
{
  "type": "array",
  "prefixItems": [
    { "type": "string" },
    { "type": "number" },
    { "type": "boolean" }
  ]
}
```

#### `minItems`
Minimum number of items in array.

```json
{
  "type": "array",
  "minItems": 1
}
```

#### `maxItems`
Maximum number of items in array.

```json
{
  "type": "array",
  "maxItems": 10
}
```

#### `uniqueItems`
All items in array must be unique.

```json
{
  "type": "array",
  "uniqueItems": true
}
```

#### `contains`
At least one item must match this schema.

```json
{
  "type": "array",
  "contains": { "type": "string" }
}
```

#### `minContains`
Minimum number of items that must match the `contains` schema.

```json
{
  "type": "array",
  "contains": { "type": "number", "minimum": 10 },
  "minContains": 2
}
```

#### `maxContains`
Maximum number of items that can match the `contains` schema.

```json
{
  "type": "array",
  "contains": { "type": "number", "minimum": 10 },
  "maxContains": 5
}
```

---

### Schema Composition

#### `allOf`
Value must validate against ALL subschemas.

```json
{
  "allOf": [
    { "type": "string", "minLength": 3 },
    { "pattern": "^[A-Z]" }
  ]
}
```

#### `anyOf`
Value must validate against AT LEAST ONE subschema.

```json
{
  "anyOf": [
    { "type": "string" },
    { "type": "number" }
  ]
}
```

#### `oneOf`
Value must validate against EXACTLY ONE subschema.

```json
{
  "oneOf": [
    { "type": "number", "multipleOf": 5 },
    { "type": "number", "multipleOf": 3 }
  ]
}
```

**Also used for radio buttons and select dropdowns:**

```json
{
  "oneOf": [
    { "const": "option1", "title": "First Option" },
    { "const": "option2", "title": "Second Option" }
  ]
}
```

#### `not`
Value must NOT validate against the schema.

```json
{
  "not": { "type": "string" }
}
```

---

### Conditional Logic

#### `if/then/else`
Conditional schema application based on data.

```json
{
  "type": "object",
  "properties": {
    "accountType": { "enum": ["personal", "business"] },
    "companyName": { "type": "string" }
  },
  "if": {
    "properties": { "accountType": { "const": "business" } }
  },
  "then": {
    "required": ["companyName"]
  }
}
```

---

### Metadata

#### `title`
Human-readable field name (converted to field `label`).

```json
{
  "type": "string",
  "title": "Full Name"
}
```

#### `description`
Field description or help text.

```json
{
  "type": "string",
  "description": "Enter your legal first and last name"
}
```

#### `default`
Default value for the field.

```json
{
  "type": "string",
  "default": "Hello World"
}
```

---

## Custom x-jsf-* Extensions

These are custom extensions specific to `@laus/json-schema-form` for enhanced form functionality.

### `x-jsf-presentation`

Defines UI presentation hints for the field. All properties are spread to the field level.

#### Core Properties

##### `inputType`
Override the automatically inferred input type.

**Available types:**
- `text` - Standard text input
- `textarea` - Multi-line text area
- `email` - Email input
- `number` - Numeric input
- `money` - Currency/money input
- `date` - Date picker
- `select` - Dropdown select
- `radio` - Radio button group
- `checkbox` - Checkbox input
- `file` - File upload
- `fieldset` - Nested object group
- `group-array` - Array of objects with repeating fields
- `country` - Country selector
- `hidden` - Hidden field
- `autocomplete` - Autocomplete/searchable select

```json
{
  "type": "string",
  "x-jsf-presentation": {
    "inputType": "textarea"
  }
}
```

##### `description`
Additional field description/help text (supplements standard `description`).

```json
{
  "type": "string",
  "x-jsf-presentation": {
    "description": "This will appear as help text"
  }
}
```

#### File Input Properties

##### `accept`
Comma-separated list of accepted file formats.

```json
{
  "type": "string",
  "format": "data-url",
  "x-jsf-presentation": {
    "accept": ".pdf,.doc,.docx"
  }
}
```

##### `maxFileSize`
Maximum file size in kilobytes (KB).

```json
{
  "type": "string",
  "format": "data-url",
  "x-jsf-presentation": {
    "maxFileSize": 5120
  }
}
```

#### Date Input Properties

##### `minDate`
Minimum allowed date (yyyy-MM-dd format).

```json
{
  "type": "string",
  "format": "date",
  "x-jsf-presentation": {
    "minDate": "2024-01-01"
  }
}
```

##### `maxDate`
Maximum allowed date (yyyy-MM-dd format).

```json
{
  "type": "string",
  "format": "date",
  "x-jsf-presentation": {
    "maxDate": "2024-12-31"
  }
}
```

#### Async Options Properties

##### `asyncOptions`
Configuration for asynchronously loaded options (for autocomplete/select fields).

```json
{
  "type": "string",
  "x-jsf-presentation": {
    "inputType": "autocomplete",
    "asyncOptions": {
      "id": "loadCountries",
      "searchable": true,
      "paginated": true,
      "debounceMs": 300,
      "dependencies": ["region"],
      "params": {
        "endpoint": "/api/countries"
      }
    }
  }
}
```

**Properties:**
- `id` (required) - Unique identifier for the async loader function
- `searchable` - Enable search/filter functionality
- `paginated` - Enable pagination
- `debounceMs` - Debounce time for search in milliseconds (default: 300)
- `dependencies` - Array of field names that trigger reload when changed
- `params` - Custom parameters passed to the loader function

See [Async Options](#async-options) for loader implementation details.

#### Custom Properties

Any additional properties in `x-jsf-presentation` are spread to the field object for consumption by UI frameworks.

```json
{
  "type": "string",
  "x-jsf-presentation": {
    "placeholder": "Enter value...",
    "helperText": "Additional guidance",
    "customProp": "any value"
  }
}
```

---

### `x-jsf-order`

Defines the display order of properties in an object or items in an array.

```json
{
  "type": "object",
  "properties": {
    "lastName": { "type": "string" },
    "firstName": { "type": "string" },
    "email": { "type": "string" }
  },
  "x-jsf-order": ["firstName", "lastName", "email"]
}
```

---

### `x-jsf-errorMessage`

Defines custom error messages for specific validation rules.

```json
{
  "type": "string",
  "minLength": 3,
  "maxLength": 50,
  "pattern": "^[A-Z]",
  "x-jsf-errorMessage": {
    "minLength": "Name must be at least 3 characters long",
    "maxLength": "Name cannot exceed 50 characters",
    "pattern": "Name must start with a capital letter",
    "required": "Name is required"
  }
}
```

**Supported error message keys:**
- All validation keywords (e.g., `minLength`, `maximum`, `pattern`)
- `required` - For required field validation
- `type` - For type mismatch errors
- Any custom validation name from `x-jsf-logic-validations`

---

### `x-jsf-layout`

Defines responsive CSS Grid-based layout configuration for form fields.

```json
{
  "type": "object",
  "x-jsf-layout": {
    "type": "columns",
    "columns": 3,
    "gap": "1rem",
    "responsive": {
      "sm": 1,
      "md": 2,
      "lg": 3,
      "xl": 4
    }
  },
  "properties": {
    "firstName": {
      "type": "string",
      "x-jsf-layout": {
        "colSpan": 2
      }
    },
    "email": {
      "type": "string",
      "x-jsf-layout": {
        "colSpan": 1
      }
    }
  }
}
```

**Properties:**
- `type` - Layout type (currently only `"columns"` supported)
- `columns` - Default number of columns
- `gap` - CSS gap value between columns (e.g., `"1rem"`, `"16px"`)
- `responsive` - Breakpoint configuration object:
  - `sm` - Small devices (number of columns)
  - `md` - Medium devices
  - `lg` - Large devices
  - `xl` - Extra large devices
- `colSpan` - Number of columns the field spans (can be number or responsive object)
- `colStart` - Grid column start position
- `colEnd` - Grid column end position

**Responsive colSpan example:**
```json
{
  "x-jsf-layout": {
    "colSpan": {
      "sm": 1,
      "md": 2,
      "lg": 3
    }
  }
}
```

---

### `x-jsf-logic`

Defines JSON Logic rules for custom validations, computed values, and conditional schema transformations.

#### Structure

```json
{
  "x-jsf-logic": {
    "validations": { /* custom validation rules */ },
    "computedValues": { /* computed value definitions */ },
    "if": { /* JSON Logic condition */ },
    "then": { /* Schema modifications when true */ },
    "else": { /* Schema modifications when false */ }
  }
}
```

#### Custom Validations

Define reusable validation rules using JSON Logic.

```json
{
  "type": "number",
  "x-jsf-logic": {
    "validations": {
      "ageCheck": {
        "rule": { ">=": [{ "var": "age" }, 18] },
        "errorMessage": "Must be 18 or older"
      },
      "rangeCheck": {
        "rule": {
          "and": [
            { ">=": [{ "var": "age" }, 18] },
            { "<=": [{ "var": "age" }, 65] }
          ]
        },
        "errorMessage": "Age must be between 18 and 65"
      }
    }
  },
  "x-jsf-logic-validations": ["ageCheck", "rangeCheck"]
}
```

#### Computed Values

Define values that are dynamically calculated based on form data.

```json
{
  "x-jsf-logic": {
    "computedValues": {
      "fullName": {
        "rule": {
          "concat": [
            { "var": "firstName" },
            " ",
            { "var": "lastName" }
          ]
        }
      },
      "isAdult": {
        "rule": { ">=": [{ "var": "age" }, 18] }
      }
    }
  }
}
```

#### Conditional Schema Transformations

Dynamically modify schema based on form values.

```json
{
  "type": "object",
  "properties": {
    "employment": { "enum": ["employed", "self-employed", "unemployed"] },
    "companyName": { "type": "string" }
  },
  "x-jsf-logic": {
    "if": {
      "in": [{ "var": "employment" }, ["employed", "self-employed"]]
    },
    "then": {
      "properties": {
        "companyName": {
          "x-jsf-presentation": {
            "description": "Enter your employer name"
          }
        }
      }
    }
  }
}
```

---

### `x-jsf-logic-validations`

References validation rules defined in root `x-jsf-logic` to apply to specific fields.

```json
{
  "type": "object",
  "x-jsf-logic": {
    "validations": {
      "passwordStrength": {
        "rule": { ">=": [{ "var": "password.length" }, 8] },
        "errorMessage": "Password must be at least 8 characters"
      }
    }
  },
  "properties": {
    "password": {
      "type": "string",
      "x-jsf-logic-validations": ["passwordStrength"]
    }
  }
}
```

---

### `x-jsf-logic-computedAttrs`

References computed values from `x-jsf-logic` to dynamically set schema attributes.

Supports:
- String references to computed values
- Handlebars-style templates with `{{ }}`

```json
{
  "type": "object",
  "x-jsf-logic": {
    "computedValues": {
      "fullName": {
        "rule": { "concat": [{ "var": "firstName" }, " ", { "var": "lastName" }] }
      },
      "ageCategory": {
        "rule": {
          "if": [
            { ">=": [{ "var": "age" }, 18] },
            "Adult",
            "Minor"
          ]
        }
      },
      "minAllowedDate": {
        "rule": { "var": "startDate" }
      }
    }
  },
  "properties": {
    "summary": {
      "type": "string",
      "x-jsf-logic-computedAttrs": {
        "title": "fullName",
        "description": "Category: {{ageCategory}}"
      }
    },
    "endDate": {
      "type": "string",
      "format": "date",
      "x-jsf-logic-computedAttrs": {
        "x-jsf-presentation": {
          "minDate": "minAllowedDate"
        }
      }
    }
  }
}
```

---

## Supported String Formats

When using `format` keyword with `type: "string"`, these formats are validated:

### Date/Time Formats (RFC 3339)
- `date` - YYYY-MM-DD format (e.g., "2024-01-15")
- `time` - HH:MM:SS with optional timezone (e.g., "14:30:00")
- `date-time` - Full ISO 8601 datetime (e.g., "2024-01-15T14:30:00Z")
- `duration` - ISO 8601 duration (e.g., "P3Y6M4DT12H30M5S")

### Email Formats
- `email` - Standard RFC 5321 email validation (max 254 characters)
- `idn-email` - Internationalized domain names in email addresses

### Hostname Formats
- `hostname` - Valid domain name
- `idn-hostname` - Internationalized domain name (max 255 characters)

### IP Address Formats
- `ipv4` - IPv4 address (e.g., "192.168.1.1")
- `ipv6` - IPv6 address (e.g., "2001:0db8:85a3::8a2e:0370:7334")

### URI Formats
- `uri` - Full URI with scheme (e.g., "https://example.com/path")
- `uri-reference` - URI reference, relative or absolute
- `iri` - Internationalized Resource Identifier
- `iri-reference` - IRI reference

### JSON/Data Formats
- `json-pointer` - JSON Pointer per RFC 6901 (e.g., "/path/to/field")
- `relative-json-pointer` - Relative JSON Pointer
- `json-pointer-uri-fragment` - JSON Pointer as URI fragment
- `uuid` - UUID per RFC 4122 (e.g., "550e8400-e29b-41d4-a716-446655440000")
- `regex` - Valid regular expression
- `uri-template` - RFC 6570 URI template

### Special Formats
- `data-url` - Used for file upload fields

---

## Input Types

The library automatically infers input types based on the schema, or you can override with `x-jsf-presentation.inputType`.

### Automatic Inference

| Schema | Inferred Input Type |
|--------|---------------------|
| `{ "type": "string" }` | `text` |
| `{ "type": "string", "format": "email" }` | `email` |
| `{ "type": "string", "format": "date" }` | `date` |
| `{ "type": "string", "format": "data-url" }` | `file` |
| `{ "type": "string", "oneOf": [...] }` | `radio` |
| `{ "type": "string", "enum": [...] }` | `select` |
| `{ "type": "number" }` or `{ "type": "integer" }` | `number` |
| `{ "type": "boolean" }` | `checkbox` |
| `{ "type": "object" }` | `fieldset` |
| `{ "type": "array", "items": { "type": "object" } }` | `group-array` |
| `{ "type": "array" }` (non-object items) | `select` |

### Available Input Types

- **`text`** - Standard single-line text input
- **`textarea`** - Multi-line text input
- **`email`** - Email input with format validation
- **`number`** - Numeric input
- **`money`** - Currency/monetary value input
- **`date`** - Date picker input
- **`select`** - Dropdown select (for enum/anyOf/oneOf)
- **`radio`** - Radio button group (for oneOf with string types)
- **`checkbox`** - Single checkbox or checkbox group
- **`file`** - File upload input
- **`fieldset`** - Container for nested object fields
- **`group-array`** - Repeating group of fields for array of objects
- **`country`** - Country selector dropdown
- **`hidden`** - Hidden field (not displayed in UI)
- **`autocomplete`** - Autocomplete/searchable select with async options support

### Override Example

```json
{
  "type": "string",
  "x-jsf-presentation": {
    "inputType": "textarea"
  }
}
```

---

## Field Structure

Each field returned by `createHeadlessForm()` has this structure:

```typescript
interface Field {
  // Identification
  name: string                    // Field name/path
  label?: string                  // Display label (from title)

  // Type information
  inputType: FieldType            // How to render (text, number, etc.)
  jsonType: JsfSchemaType         // Original JSON Schema type
  type: FieldType                 // (Deprecated, use inputType)

  // Display & behavior
  description?: string            // Help text
  required: boolean               // Is field required
  isVisible: boolean              // Should field be shown

  // Constraints
  maxLength?: number              // Max string length
  minLength?: number              // Min string length
  minimum?: number                // Min numeric value
  maximum?: number                // Max numeric value
  pattern?: string                // Regex pattern
  format?: string                 // String format

  // File constraints
  maxFileSize?: number            // Max file size in KB
  accept?: string                 // Accepted file types

  // Date constraints
  minDate?: string                // Min date (yyyy-MM-dd)
  maxDate?: string                // Max date (yyyy-MM-dd)

  // Values
  default?: unknown               // Default value
  const?: unknown                 // Constant value
  checkboxValue?: unknown         // Value when checkbox checked

  // Options & choices
  options?: Array<{               // For select/radio/checkbox
    label: string
    value: unknown
  }>
  anyOf?: unknown[]               // anyOf schemas
  enum?: unknown[]                // Enum values

  // Nested content
  fields?: Field[]                // Child fields (for fieldset/group-array)

  // Async options
  asyncOptions?: {
    id: string
    params?: Record<string, unknown>
    dependencies?: string[]
    searchable?: boolean
    paginated?: boolean
    debounceMs?: number
    loader?: AsyncOptionsLoader   // Loader function
  }

  // Validation & errors
  errorMessage?: Record<string, string>  // Custom error messages

  // Computed attributes
  computedAttributes?: Record<string, unknown>

  // Layout
  layout?: {
    type?: 'columns'
    columns?: number
    gap?: string
    responsive?: {
      sm?: number
      md?: number
      lg?: number
      xl?: number
    }
    colSpan?: number | object
    colStart?: number
    colEnd?: number
  }

  // Custom properties from x-jsf-presentation
  [key: string]: unknown
}
```

---

## JSON Logic Operations

JSON Logic expressions can be used in `x-jsf-logic` for validations and computed values.

### Comparison Operators
- `==` - Equality
- `!=` - Not equal
- `===` - Strict equality
- `!==` - Strict not equal
- `>` - Greater than
- `<` - Less than
- `>=` - Greater or equal
- `<=` - Less or equal

### Logical Operators
- `and` - All conditions must be true
- `or` - At least one condition must be true
- `!` - Logical NOT
- `!!` - Double negation (truthy check)

### Accessing Data
- `var` - Access form value by path
  ```json
  { "var": "user.name" }
  { "var": ["user.age", 0] }  // with default value
  ```

### Conditional Logic
- `if` - If/then/else logic
  ```json
  { "if": [condition, valueIfTrue, valueIfFalse] }
  ```
- `?:` - Ternary operator (alternative syntax)

### Array Operations
- `in` - Check if value is in array
  ```json
  { "in": ["apple", ["apple", "banana", "orange"]] }
  ```
- `map` - Map over array
- `filter` - Filter array
- `reduce` - Reduce array
- `all` - Check all items match condition
- `some` - Check any item matches condition
- `none` - Check no items match condition
- `merge` - Merge arrays

### String Operations
- `concat` - Concatenate strings
  ```json
  { "concat": [{ "var": "firstName" }, " ", { "var": "lastName" }] }
  ```
- `substr` - Substring extraction
- `cat` - Another concat alias

### Arithmetic Operations
- `+` - Addition
- `-` - Subtraction
- `*` - Multiplication
- `/` - Division
- `%` - Modulo

### Math Functions
- `min` - Minimum value
- `max` - Maximum value
- `round` - Round number
- `abs` - Absolute value
- `floor` - Floor function
- `ceil` - Ceiling function

### Utility
- `log` - Console logging for debugging
- `missing` - Find missing variables
- `missing_some` - Find missing variables with minimum requirement

### Custom Operations

You can add custom operations using `addCustomJsonLogicOperations()`:

```typescript
import { addCustomJsonLogicOperations } from '@laus/json-schema-form'

addCustomJsonLogicOperations({
  toUpperCase: (str: string) => str.toUpperCase(),
  calculateTax: (amount: number, rate: number) => amount * rate
})
```

---

## Async Options

For fields with dynamically loaded options (autocomplete, searchable selects).

### Configuration

Add `asyncOptions` to `x-jsf-presentation`:

```json
{
  "type": "string",
  "x-jsf-presentation": {
    "inputType": "autocomplete",
    "asyncOptions": {
      "id": "loadCountries",
      "searchable": true,
      "paginated": true,
      "debounceMs": 500,
      "dependencies": ["region"],
      "params": {
        "endpoint": "/api/countries",
        "customParam": "value"
      }
    }
  }
}
```

### Loader Function

Register loader functions when creating the form:

```typescript
const form = createHeadlessForm({
  schema,
  asyncOptionsLoaders: {
    loadCountries: async ({ search, pagination, formValues, signal }) => {
      const response = await fetch(
        `/api/countries?search=${search}&page=${pagination?.page || 1}`,
        { signal }
      )
      const data = await response.json()

      return {
        options: data.countries.map(c => ({
          label: c.name,
          value: c.code
        })),
        pagination: {
          page: data.page,
          totalPages: data.totalPages,
          hasMore: data.hasMore
        }
      }
    }
  }
})
```

### Loader Context

The loader function receives a context object:

```typescript
interface AsyncOptionsLoaderContext {
  search?: string              // Current search query
  pagination?: {
    page: number               // Current page number
    hasMore?: boolean          // Whether more results exist
  }
  formValues: ObjectValue      // Current form values (for dependencies)
  signal?: AbortSignal         // For cancelling requests
}
```

### Loader Response

The loader must return:

```typescript
interface AsyncOptionsLoaderResponse {
  options: Array<{
    label: string
    value: unknown
  }>
  pagination?: {
    page: number
    totalPages?: number
    hasMore?: boolean
  }
}
```

---

## Validation Error Types

When validation fails, errors are returned with these types:

### Core Validation Errors
- `type` - Value doesn't match required type
- `required` - Required field is missing or empty
- `forbidden` - Value provided against schema `false`
- `const` - Value doesn't match constant
- `enum` - Value not in enum list
- `additionalProperties` - Additional property not allowed

### String Validation Errors
- `minLength` - String too short
- `maxLength` - String too long
- `pattern` - String doesn't match regex pattern
- `format` - String doesn't match format requirement

### Number Validation Errors
- `minimum` - Number too small (inclusive)
- `maximum` - Number too large (inclusive)
- `exclusiveMinimum` - Number not greater than minimum
- `exclusiveMaximum` - Number not less than maximum
- `multipleOf` - Number not a multiple of value

### Array Validation Errors
- `minItems` - Too few items in array
- `maxItems` - Too many items in array
- `uniqueItems` - Array contains duplicate items
- `contains` - No items match contains schema
- `minContains` - Too few items match contains schema
- `maxContains` - Too many items match contains schema

### Date Validation Errors
- `minDate` - Date before minimum allowed date
- `maxDate` - Date after maximum allowed date

### File Validation Errors
- `fileStructure` - Invalid file object structure
- `maxFileSize` - File exceeds maximum size limit
- `accept` - File format not in accepted types

### Composition Validation Errors
- `allOf` - Validation failed against one of allOf schemas
- `anyOf` - Validation failed against all anyOf schemas
- `oneOf` - Validation failed exactly-one requirement
- `not` - Validation passed against not schema (should fail)

### Custom Validation Errors
- `json-logic` - Custom JSON Logic validation failed

### Error Structure

```typescript
interface ValidationError {
  keyword: string              // Error type (from list above)
  instancePath: string         // Path to field with error (e.g., "/user/name")
  message: string              // Error message
  params?: Record<string, any> // Additional error context
}
```

---

## Examples

### Complete Form Example

```json
{
  "type": "object",
  "x-jsf-layout": {
    "type": "columns",
    "columns": 2,
    "gap": "1rem"
  },
  "properties": {
    "firstName": {
      "type": "string",
      "title": "First Name",
      "minLength": 2,
      "maxLength": 50,
      "x-jsf-errorMessage": {
        "required": "Please enter your first name",
        "minLength": "First name must be at least 2 characters"
      }
    },
    "lastName": {
      "type": "string",
      "title": "Last Name",
      "minLength": 2,
      "maxLength": 50
    },
    "email": {
      "type": "string",
      "format": "email",
      "title": "Email Address",
      "x-jsf-layout": {
        "colSpan": 2
      }
    },
    "age": {
      "type": "integer",
      "minimum": 18,
      "maximum": 120,
      "title": "Age",
      "x-jsf-logic-validations": ["ageVerification"]
    },
    "country": {
      "type": "string",
      "title": "Country",
      "x-jsf-presentation": {
        "inputType": "autocomplete",
        "asyncOptions": {
          "id": "loadCountries",
          "searchable": true
        }
      }
    },
    "resume": {
      "type": "string",
      "format": "data-url",
      "title": "Resume",
      "x-jsf-presentation": {
        "accept": ".pdf,.doc,.docx",
        "maxFileSize": 5120
      },
      "x-jsf-layout": {
        "colSpan": 2
      }
    }
  },
  "required": ["firstName", "lastName", "email", "age"],
  "x-jsf-order": ["firstName", "lastName", "email", "age", "country", "resume"],
  "x-jsf-logic": {
    "validations": {
      "ageVerification": {
        "rule": { ">=": [{ "var": "age" }, 18] },
        "errorMessage": "You must be at least 18 years old"
      }
    }
  }
}
```

---

For more examples and live demos, visit:
- **Documentation**: https://json-schema-form.vercel.app/
- **Playground**: https://json-schema-form.vercel.app/?path=/docs/playground--docs
- **Repository**: https://github.com/DaikonCOde/json-schema-form
