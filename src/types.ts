import type { RulesLogic } from 'json-logic-js'
import type { JSONSchema } from 'json-schema-typed/draft-2020-12'
import type { FieldType } from './field/type'
/**
 * Defines the type of a `Field` in the form.
 */
export type JsfSchemaType = Exclude<JSONSchema, boolean>['type']

/**
 * Defines the type of a value in the form that will be validated against the schema.
 */
export type SchemaValue = string | number | ObjectValue | null | undefined | Array<SchemaValue> | boolean

/**
 * A nested object value.
 */
export interface ObjectValue {
  [key: string]: SchemaValue
}

/**
 * Responsive breakpoint configuration for container layout
 */
export interface ResponsiveBreakpoints {
  /** Small screens (e.g., mobile) */
  sm?: number
  /** Medium screens (e.g., tablet) */
  md?: number
  /** Large screens (e.g., desktop) */
  lg?: number
  /** Extra large screens */
  xl?: number
}

/**
 * Responsive configuration for individual field properties
 */
export interface ResponsiveFieldConfig {
  /** Small screens (e.g., mobile) */
  sm?: number
  /** Medium screens (e.g., tablet) */
  md?: number
  /** Large screens (e.g., desktop) */
  lg?: number
  /** Extra large screens */
  xl?: number
}

/**
 * Layout configuration for responsive column layouts
 */
export interface JsfLayoutConfig {
  /** Layout type - currently only 'columns' is supported */
  type?: 'columns'
  /** Number of columns for the default layout */
  columns?: number
  /** Gap between columns (CSS gap property) */
  gap?: string
  /** Responsive breakpoint configuration for container */
  responsive?: ResponsiveBreakpoints
  /** Column span for individual fields (can be number or responsive) */
  colSpan?: number | ResponsiveFieldConfig
  /** Column start position for individual fields (can be number or responsive) */
  colStart?: number | ResponsiveFieldConfig
  /** Column end position for individual fields (can be number or responsive) */
  colEnd?: number | ResponsiveFieldConfig
}

/**
 * Pagination info for async options
 */
export interface AsyncOptionsPaginationInfo {
  /** Current page number */
  page: number
  /** Total number of pages available */
  totalPages?: number
  /** Whether there are more pages to load */
  hasMore?: boolean
}

/**
 * Context provided to async option loaders
 */
export interface AsyncOptionsLoaderContext {
  /** Current search query (if any) */
  search?: string
  /** Current pagination info */
  pagination?: AsyncOptionsPaginationInfo
  /** Current form values (useful for dependent fields) */
  formValues: ObjectValue
  /** Signal for aborting the request */
  signal?: AbortSignal
}

/**
 * Result returned by async option loaders
 */
export interface AsyncOptionsLoaderResult {
  /** Array of options to display */
  options: Array<{ label: string; value: unknown; [key: string]: unknown }>
  /** Optional pagination info for the next load */
  pagination?: AsyncOptionsPaginationInfo
}

/**
 * Async options loader function signature
 * @param context - Context with search, pagination, and form values
 * @returns Promise resolving to options and optional pagination info
 */
export type AsyncOptionsLoader = (
  context: AsyncOptionsLoaderContext
) => Promise<AsyncOptionsLoaderResult>

/**
 * Configuration for async options in the schema
 */
export interface AsyncOptionsConfig {
  /** Unique identifier for the async loader */
  id: string
  /** Optional parameters to pass to the loader (e.g., endpoint, filters) */
  params?: Record<string, unknown>
  /** 
   * Field names that this select depends on.
   * When these fields change, the options will be reloaded.
   */
  dependencies?: string[]
  /**
   * Whether to enable search functionality
   * @default false
   */
  searchable?: boolean
  /**
   * Whether to enable pagination
   * @default false
   */
  paginated?: boolean
  /**
   * Debounce time in milliseconds for search
   * @default 300
   */
  debounceMs?: number
}

export type JsfPresentation = {
  inputType?: FieldType
  description?: string
  accept?: string
  maxFileSize?: number
  minDate?: string
  maxDate?: string
  /** Configuration for asynchronously loaded options */
  asyncOptions?: AsyncOptionsConfig
} & {
  [key: string]: unknown
}

export interface JsonLogicContext {
  schema: JsonLogicRules
  value: SchemaValue
}

// x-jsf-logic schema can have validations/computedValues as well as conditional rules present in any JSON Schema
export interface JsonLogicRules {
  validations?: Record<string, {
    errorMessage?: string
    rule: RulesLogic
  }>
  computedValues?: Record<string, {
    rule: RulesLogic
  }>
}
export interface JsonLogicRootSchema extends Pick<NonBooleanJsfSchema, 'if' | 'then' | 'else' | 'allOf' | 'anyOf' | 'oneOf' | 'not'> {}

export interface JsonLogicSchema extends JsonLogicRules, JsonLogicRootSchema {}

/**
 * JSON Schema Form extending JSON Schema with additional JSON Schema Form properties.
 */
export type JsfSchema = JSONSchema & {
  'properties'?: Record<string, JsfSchema>
  'items'?: JsfSchema
  'enum'?: unknown[]
  'anyOf'?: JsfSchema[]
  'allOf'?: JsfSchema[]
  'oneOf'?: JsfSchema[]
  'not'?: JsfSchema
  'if'?: JsfSchema
  'then'?: JsfSchema
  'else'?: JsfSchema
  // while value is not part of the spec, we're keeping it for v0 backwards compatibility
  'value'?: SchemaValue
  // Note: if we don't have this property here, when inspecting any recursive
  // schema (like an if inside another schema), the required property won't be
  // present in the type
  'required'?: string[]
  /** Defines the order of the fields in the form. */
  'x-jsf-order'?: string[]
  /** Defines the presentation of the field in the form.  */
  'x-jsf-presentation'?: JsfPresentation
  /** Defines the layout configuration for the form or field. */
  'x-jsf-layout'?: JsfLayoutConfig
  /** Defines the error message of the field in the form. */
  'x-jsf-errorMessage'?: Record<string, string>
  /** Defines all JSON Logic rules for the schema (both validations and computed values). */
  'x-jsf-logic'?: JsonLogicSchema
  /** Extra validations to run. References validations declared in the `x-jsf-logic` root property. */
  'x-jsf-logic-validations'?: string[]
  /** Extra attributes to add to the schema. References computedValues in the `x-jsf-logic` root property. */
  'x-jsf-logic-computedAttrs'?: Record<string, string | object>
}

/**
 * JSON Schema Form type without booleans.
 * This type is used for convenience in places where a boolean is not allowed.
 * @see `JsfSchema` for the full schema type which allows booleans and is used for sub schemas.
 */
export type NonBooleanJsfSchema = Exclude<JsfSchema, boolean>

/**
 * JSON Schema Form type specifically for object schemas.
 * This type ensures the schema has type 'object'.
 */
export type JsfObjectSchema = NonBooleanJsfSchema & {
  type: 'object'
}
