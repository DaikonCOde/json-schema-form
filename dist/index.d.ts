import { RulesLogic } from 'json-logic-js';
import { JSONSchema } from 'json-schema-typed/draft-2020-12';

/**
 * Defines the type of a `Field` in the form.
 */
type JsfSchemaType = Exclude<JSONSchema, boolean>['type'];
/**
 * Defines the type of a value in the form that will be validated against the schema.
 */
type SchemaValue = string | number | ObjectValue | null | undefined | Array<SchemaValue> | boolean;
/**
 * A nested object value.
 */
interface ObjectValue {
    [key: string]: SchemaValue;
}
/**
 * Responsive breakpoint configuration for container layout
 */
interface ResponsiveBreakpoints {
    /** Small screens (e.g., mobile) */
    sm?: number;
    /** Medium screens (e.g., tablet) */
    md?: number;
    /** Large screens (e.g., desktop) */
    lg?: number;
    /** Extra large screens */
    xl?: number;
}
/**
 * Responsive configuration for individual field properties
 */
interface ResponsiveFieldConfig {
    /** Small screens (e.g., mobile) */
    sm?: number;
    /** Medium screens (e.g., tablet) */
    md?: number;
    /** Large screens (e.g., desktop) */
    lg?: number;
    /** Extra large screens */
    xl?: number;
}
/**
 * Layout configuration for responsive column layouts
 */
interface JsfLayoutConfig {
    /** Layout type - currently only 'columns' is supported */
    type?: 'columns';
    /** Number of columns for the default layout */
    columns?: number;
    /** Gap between columns (CSS gap property) */
    gap?: string;
    /** Responsive breakpoint configuration for container */
    responsive?: ResponsiveBreakpoints;
    /** Column span for individual fields (can be number or responsive) */
    colSpan?: number | ResponsiveFieldConfig;
    /** Column start position for individual fields (can be number or responsive) */
    colStart?: number | ResponsiveFieldConfig;
    /** Column end position for individual fields (can be number or responsive) */
    colEnd?: number | ResponsiveFieldConfig;
}
/**
 * Pagination info for async options
 */
interface AsyncOptionsPaginationInfo {
    /** Current page number */
    page: number;
    /** Total number of pages available */
    totalPages?: number;
    /** Whether there are more pages to load */
    hasMore?: boolean;
}
/**
 * Context provided to async option loaders
 */
interface AsyncOptionsLoaderContext {
    /** Current search query (if any) */
    search?: string;
    /** Current pagination info */
    pagination?: AsyncOptionsPaginationInfo;
    /** Current form values (useful for dependent fields) */
    formValues: ObjectValue;
    /** Signal for aborting the request */
    signal?: AbortSignal;
}
/**
 * Result returned by async option loaders
 */
interface AsyncOptionsLoaderResult {
    /** Array of options to display */
    options: Array<{
        label: string;
        value: unknown;
        [key: string]: unknown;
    }>;
    /** Optional pagination info for the next load */
    pagination?: AsyncOptionsPaginationInfo;
}
/**
 * Async options loader function signature
 * @param context - Context with search, pagination, and form values
 * @returns Promise resolving to options and optional pagination info
 */
type AsyncOptionsLoader = (context: AsyncOptionsLoaderContext) => Promise<AsyncOptionsLoaderResult>;
/**
 * Configuration for async options in the schema
 */
interface AsyncOptionsConfig {
    /** Unique identifier for the async loader */
    id: string;
    /** Optional parameters to pass to the loader (e.g., endpoint, filters) */
    params?: Record<string, unknown>;
    /**
     * Field names that this select depends on.
     * When these fields change, the options will be reloaded.
     */
    dependencies?: string[];
    /**
     * Whether to enable search functionality
     * @default false
     */
    searchable?: boolean;
    /**
     * Whether to enable pagination
     * @default false
     */
    paginated?: boolean;
    /**
     * Debounce time in milliseconds for search
     * @default 300
     */
    debounceMs?: number;
}
type JsfPresentation = {
    inputType?: FieldType;
    description?: string;
    accept?: string;
    maxFileSize?: number;
    minDate?: string;
    maxDate?: string;
    /** Configuration for asynchronously loaded options */
    asyncOptions?: AsyncOptionsConfig;
} & {
    [key: string]: unknown;
};
interface JsonLogicRules {
    validations?: Record<string, {
        errorMessage?: string;
        rule: RulesLogic;
    }>;
    computedValues?: Record<string, {
        rule: RulesLogic;
    }>;
}
interface JsonLogicRootSchema extends Pick<NonBooleanJsfSchema, 'if' | 'then' | 'else' | 'allOf' | 'anyOf' | 'oneOf' | 'not'> {
}
interface JsonLogicSchema extends JsonLogicRules, JsonLogicRootSchema {
}
/**
 * JSON Schema Form extending JSON Schema with additional JSON Schema Form properties.
 */
type JsfSchema = JSONSchema & {
    'properties'?: Record<string, JsfSchema>;
    'items'?: JsfSchema;
    'enum'?: unknown[];
    'anyOf'?: JsfSchema[];
    'allOf'?: JsfSchema[];
    'oneOf'?: JsfSchema[];
    'not'?: JsfSchema;
    'if'?: JsfSchema;
    'then'?: JsfSchema;
    'else'?: JsfSchema;
    'value'?: SchemaValue;
    'required'?: string[];
    /** Defines the order of the fields in the form. */
    'x-jsf-order'?: string[];
    /** Defines the presentation of the field in the form.  */
    'x-jsf-presentation'?: JsfPresentation;
    /** Defines the layout configuration for the form or field. */
    'x-jsf-layout'?: JsfLayoutConfig;
    /** Defines the error message of the field in the form. */
    'x-jsf-errorMessage'?: Record<string, string>;
    /** Defines all JSON Logic rules for the schema (both validations and computed values). */
    'x-jsf-logic'?: JsonLogicSchema;
    /** Extra validations to run. References validations declared in the `x-jsf-logic` root property. */
    'x-jsf-logic-validations'?: string[];
    /** Extra attributes to add to the schema. References computedValues in the `x-jsf-logic` root property. */
    'x-jsf-logic-computedAttrs'?: Record<string, string | object>;
};
/**
 * JSON Schema Form type without booleans.
 * This type is used for convenience in places where a boolean is not allowed.
 * @see `JsfSchema` for the full schema type which allows booleans and is used for sub schemas.
 */
type NonBooleanJsfSchema = Exclude<JsfSchema, boolean>;
/**
 * JSON Schema Form type specifically for object schemas.
 * This type ensures the schema has type 'object'.
 */
type JsfObjectSchema = NonBooleanJsfSchema & {
    type: 'object';
};

/**
 * WIP type for UI field output that allows for all `x-jsf-presentation` properties to be splatted
 * TODO/QUESTION: what are the required fields for a field? what are the things we want to deprecate, if any?
 */
interface Field {
    name: string;
    label?: string;
    description?: string;
    fields?: Field[];
    type: FieldType;
    inputType: FieldType;
    required: boolean;
    jsonType: JsfSchemaType;
    isVisible: boolean;
    accept?: string;
    errorMessage?: Record<string, string>;
    computedAttributes?: Record<string, unknown>;
    minDate?: string;
    maxDate?: string;
    maxLength?: number;
    maxFileSize?: number;
    format?: string;
    anyOf?: unknown[];
    options?: unknown[];
    const?: unknown;
    checkboxValue?: unknown;
    default?: unknown;
    asyncOptions?: AsyncOptionsConfig & {
        /**
         * Direct access to the loader function.
         * Call it with a context object containing formValues.
         *
         * @example
         * ```ts
         * // Simple usage
         * const result = await field.asyncOptions.loader({
         *   search: 'query',
         *   formValues: currentFormValues,
         * })
         *
         * // With pagination
         * const result = await field.asyncOptions.loader({
         *   search: 'query',
         *   pagination: { page: 2 },
         *   formValues: currentFormValues,
         * })
         * ```
         */
        loader?: AsyncOptionsLoader;
    };
    layout?: {
        type?: 'columns';
        columns?: number;
        gap?: string;
        responsive?: {
            sm?: number;
            md?: number;
            lg?: number;
            xl?: number;
        };
        colSpan?: number | {
            sm?: number;
            md?: number;
            lg?: number;
            xl?: number;
        };
        colStart?: number | {
            sm?: number;
            md?: number;
            lg?: number;
            xl?: number;
        };
        colEnd?: number | {
            sm?: number;
            md?: number;
            lg?: number;
            xl?: number;
        };
    };
    _rootLayout?: {
        type?: 'columns';
        columns?: number;
        gap?: string;
        responsive?: {
            sm?: number;
            md?: number;
            lg?: number;
            xl?: number;
        };
    };
    [key: string]: unknown;
}
type FieldType = 'text' | 'number' | 'select' | 'file' | 'radio' | 'group-array' | 'email' | 'date' | 'checkbox' | 'fieldset' | 'money' | 'country' | 'textarea' | 'hidden' | 'autocomplete';

interface LegacyOptions {
    /**
     * A null value will be treated as undefined.
     * When true, providing a value to a schema that is `false`,
     * the validation will succeed instead of returning a type error.
     * This was a bug in v0, we fixed it in v1. If you need the same wrong behavior, set this to true.
     * @default false
     * @example
     * ```ts
     * Schema: { "properties": { "name": { "type": "string" } } }
     * Value: { "name": null } // Validation succeeds, even though the type is not 'null'
     * ```
     */
    treatNullAsUndefined?: boolean;
    /**
     * A value against a schema "false" will be allowed.
     * When true, providing a value to a non-required field that is not of type 'null' or ['null']
     * the validation will succeed instead of returning a type error.
     * This was a bug in v0, we fixed it in v1. If you need the same wrong behavior, set this to true.
     * @default false
     * @example
     * ```ts
     * Schema: { "properties": { "age": false } }
     * Value: { age: 10 } // Validation succeeds, even though the value is forbidden;
     * ```
     */
    allowForbiddenValues?: boolean;
}

interface FormResult {
    fields: Field[];
    isError: boolean;
    error: string | null;
    handleValidation: (value: SchemaValue) => ValidationResult;
    layout?: JsfLayoutConfig | null;
}
/**
 * Recursive type for form error messages
 * - String for leaf error messages
 * - Nested object for nested fields
 * - Arrays for group-array fields
 */
interface FormErrors {
    [key: string]: string | FormErrors | Array<null | FormErrors>;
}
interface ValidationResult {
    formErrors?: FormErrors;
}
interface CreateHeadlessFormOptions {
    /**
     * The initial values to use for the form
     */
    initialValues?: SchemaValue;
    /**
     * Backward compatibility config with v0
     */
    legacyOptions?: LegacyOptions;
    /**
     * When enabled, ['x-jsf-presentation'].inputType is required for all properties.
     * @default false
     */
    strictInputType?: boolean;
    /**
     * Custom user defined functions. A dictionary of name and function
     */
    customJsonLogicOps?: Record<string, (...args: any[]) => any>;
    /**
     * Async option loaders for select fields.
     * Maps loader IDs (from schema's asyncOptions.id) to loader functions.
     *
     * @example
     * ```ts
     * {
     *   'countries-loader': async (context) => {
     *     const response = await fetch('/api/countries')
     *     return { options: await response.json() }
     *   }
     * }
     * ```
     */
    asyncLoaders?: Record<string, AsyncOptionsLoader>;
}
declare function createHeadlessForm(schema: JsfObjectSchema, options?: CreateHeadlessFormOptions): FormResult;

type FieldOutput = Partial<JsfSchema>;
type FieldModification = Partial<JsfSchema> & {
    /**
     * @deprecated Use `x-jsf-presentation` instead
     */
    presentation?: JsfSchema['x-jsf-presentation'];
    /**
     * @deprecated Use `x-jsf-errorMessage` instead
     */
    errorMessage?: JsfSchema['x-jsf-errorMessage'];
};
interface ModifyConfig {
    fields?: Record<string, FieldModification | ((attrs: JsfSchema) => FieldOutput)>;
    allFields?: (name: string, attrs: JsfSchema) => FieldModification;
    create?: Record<string, FieldModification>;
    pick?: string[];
    orderRoot?: string[] | ((originalOrder: string[]) => string[]);
    muteLogging?: boolean;
}
type WarningType = 'FIELD_TO_CHANGE_NOT_FOUND' | 'ORDER_MISSING_FIELDS' | 'FIELD_TO_CREATE_EXISTS' | 'PICK_MISSED_FIELD';
interface Warning {
    type: WarningType;
    message: string;
    meta?: Record<string, any>;
}
/**
 * Modifies the schema
 * Use modify() when you need to customize the generated fields. This function creates a new version of JSON schema based on a provided configuration. Then you pass the new schema to createHeadlessForm()
 *
 * @example
 * const modifiedSchema = modify(schema, {
 *   fields: {
 *     name: { type: 'string', title: 'Name' },
 *   },
 * })
 * @param {JsfSchema} originalSchema - The original schema
 * @param {ModifyConfig} config - The config
 * @returns {ModifyResult} The new schema and the warnings that occurred during the modifications
 */
declare function modifySchema(originalSchema: JsfSchema, config: ModifyConfig): {
    schema: JsfSchema;
    warnings: (Warning | null)[];
};

/**
 * Default layout configuration values
 */
declare const DEFAULT_LAYOUT_CONFIG: Required<Pick<JsfLayoutConfig, 'type' | 'columns' | 'gap'>>;
/**
 * Validates a layout configuration object
 * @param layout - The layout configuration to validate
 * @returns Whether the layout configuration is valid
 */
declare function isValidLayoutConfig(layout: any): layout is JsfLayoutConfig;
/**
 * Normalizes a layout configuration by merging with defaults
 * @param layout - The layout configuration to normalize
 * @returns Normalized layout configuration
 */
declare function normalizeLayoutConfig(layout?: JsfLayoutConfig): JsfLayoutConfig;
/**
 * Extracts layout information from a field for easier consumption by UI libraries
 * @param field - The field to extract layout from
 * @returns Layout information or null if no layout is configured
 */
declare function getFieldLayoutInfo(field: Field): JsfLayoutConfig | null;
/**
 * Extracts root container layout information from any field in a form
 * @param field - Any field from the form
 * @returns Root container layout information or null if no layout is configured
 */
declare function getRootLayoutInfo(field: Field): JsfLayoutConfig | null;
/**
 * Gets the effective layout for a form container by checking the first field's root layout
 * @param fields - Array of fields from createHeadlessForm
 * @returns Container layout information or null
 */
declare function getFormContainerLayout(fields: Field[]): JsfLayoutConfig | null;
/**
 * Generates CSS Grid style properties from layout configuration
 * @param layout - The layout configuration
 * @returns CSS properties object for CSS Grid
 */
declare function generateCSSGridProperties(layout: JsfLayoutConfig): Record<string, string>;
/**
 * Generates responsive CSS media queries for layout
 * @param layout - The layout configuration with responsive settings
 * @param breakpoints - Custom breakpoints (optional)
 * @returns CSS media query string
 */
declare function generateResponsiveCSS(layout: JsfLayoutConfig, breakpoints?: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
}): string;
/**
 * Generates responsive CSS media queries for individual field properties
 * @param layout - The field layout configuration with responsive settings
 * @param breakpoints - Custom breakpoints (optional)
 * @returns CSS media query string for individual fields
 */
declare function generateResponsiveFieldCSS(layout: JsfLayoutConfig, breakpoints?: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
}): string;
/**
 * Utility function to get the base (non-responsive) value from a field property
 * @param value - The field property value (can be number or responsive object)
 * @returns The base value or undefined
 */
declare function getBaseFieldValue(value: number | ResponsiveFieldConfig | undefined): number | undefined;

export { type AsyncOptionsConfig, type AsyncOptionsLoader, type AsyncOptionsLoaderContext, type AsyncOptionsLoaderResult, type AsyncOptionsPaginationInfo, type CreateHeadlessFormOptions, DEFAULT_LAYOUT_CONFIG, type Field, type FieldType, type FormErrors, type JsfLayoutConfig, type JsfObjectSchema, type LegacyOptions, type ResponsiveBreakpoints, type ResponsiveFieldConfig, type SchemaValue, type ValidationResult, createHeadlessForm, generateCSSGridProperties, generateResponsiveCSS, generateResponsiveFieldCSS, getBaseFieldValue, getFieldLayoutInfo, getFormContainerLayout, getRootLayoutInfo, isValidLayoutConfig, modifySchema as modify, normalizeLayoutConfig };
