import type { AsyncOptionsConfig, AsyncOptionsLoader, JsfSchemaType, ObjectValue } from '../types'

/**
 * WIP type for UI field output that allows for all `x-jsf-presentation` properties to be splatted
 * TODO/QUESTION: what are the required fields for a field? what are the things we want to deprecate, if any?
 */
export interface Field {
  name: string
  label?: string
  description?: string
  fields?: Field[]
  // @deprecated in favor of inputType,
  type: FieldType
  inputType: FieldType
  required: boolean
  jsonType: JsfSchemaType
  isVisible: boolean
  accept?: string
  errorMessage?: Record<string, string>
  computedAttributes?: Record<string, unknown>
  minDate?: string
  maxDate?: string
  maxLength?: number
  maxFileSize?: number
  format?: string
  anyOf?: unknown[]
  options?: unknown[]
  const?: unknown
  checkboxValue?: unknown
  default?: unknown

  // Async options configuration and loader
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
    loader?: AsyncOptionsLoader
  }

  // Layout properties from x-jsf-layout
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
    colSpan?: number | {
      sm?: number
      md?: number
      lg?: number
      xl?: number
    }
    colStart?: number | {
      sm?: number
      md?: number
      lg?: number
      xl?: number
    }
    colEnd?: number | {
      sm?: number
      md?: number
      lg?: number
      xl?: number
    }
  }
  
  // Internal property to store root container layout information
  _rootLayout?: {
    type?: 'columns'
    columns?: number
    gap?: string
    responsive?: {
      sm?: number
      md?: number
      lg?: number
      xl?: number
    }
  }

  // Allow additional properties from x-jsf-presentation (e.g. meta from oneOf/anyOf)
  [key: string]: unknown
}

/**
 * Field option
 * @description
 * Represents a key/value pair that is used to populate the options for a field.
 * Will be created from the oneOf/anyOf elements in a schema.
 */
export interface FieldOption {
  label: string
  value: unknown
  [key: string]: unknown
}

export type FieldType = 'text' | 'number' | 'select' | 'file' | 'radio' | 'group-array' | 'email' | 'date' | 'checkbox' | 'fieldset' | 'money' | 'country' | 'textarea' | 'hidden'
