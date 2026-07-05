import type { SchemaValidationErrorType } from '.'
import type { Locale } from '../i18n'
import type { NonBooleanJsfSchema, SchemaValue } from '../types'
import { randexp } from 'randexp'
// [fork] i18n hook: the locale tables live in `src/i18n` (fork-only, no merge
// conflicts). This file keeps only the switch that maps a validation to a
// message. See MAINTAINING.md.
import { getTable } from '../i18n'
import { convertKBToMB } from '../utils'
import { DATE_FORMAT } from '../validation/custom/date'

export type { Locale }

/**
 * Check if the schema is a checkbox
 * @param schema - The schema to check
 * @returns True if the schema is a checkbox, false otherwise
 */
function isCheckbox(schema: NonBooleanJsfSchema): boolean {
  return schema['x-jsf-presentation']?.inputType === 'checkbox'
}

export function getErrorMessage(
  schema: NonBooleanJsfSchema,
  value: SchemaValue,
  validation: SchemaValidationErrorType,
  customErrorMessage?: string,
  locale: Locale = 'en',
): string {
  const t = getTable(locale)
  const presentation = schema['x-jsf-presentation']
  switch (validation) {
    // Core validation
    case 'type':
      return t.typeError(schema.type)
    case 'required':
      if (isCheckbox(schema)) {
        return t.checkboxAck
      }
      return t.required
    case 'forbidden':
      return t.forbidden
    case 'const':
      // Boolean checkboxes that are required will come as a "const" validation error as the "empty" value is false
      if (isCheckbox(schema) && value === false) {
        return t.checkboxAck
      }
      return t.constValue(JSON.stringify(schema.const))
    case 'enum':
      return t.optionInvalid(valueToString(value))
    // Schema composition
    case 'oneOf':
      return t.optionInvalid(valueToString(value))
    case 'anyOf':
      return t.optionInvalid(valueToString(value))
    case 'not':
      return t.not
    // String validation
    case 'minLength':
      return t.minLength(schema.minLength)
    case 'maxLength':
      return t.maxLength(schema.maxLength)
    case 'pattern':
      return t.pattern(randexp(schema.pattern || ''))
    case 'format':
      if (schema.format === 'email') {
        return t.formatEmail
      }

      if (schema.format === 'date') {
        const currentDate = new Date().toISOString().split('T')[0]
        return t.formatDate(DATE_FORMAT.toLowerCase(), currentDate)
      }

      return t.formatOther(String(schema.format))
    // Number validation
    case 'multipleOf':
      return t.multipleOf(schema.multipleOf)
    case 'maximum':
      return t.maximum(schema.maximum)
    case 'exclusiveMaximum':
      return t.exclusiveMaximum(schema.exclusiveMaximum)
    case 'minimum':
      return t.minimum(schema.minimum)
    case 'exclusiveMinimum':
      return t.exclusiveMinimum(schema.exclusiveMinimum)
    // Date validation
    case 'minDate':
      return t.minDate(presentation?.minDate)
    case 'maxDate':
      return t.maxDate(presentation?.maxDate)
    // File validation
    case 'fileStructure':
      return t.fileStructure
    case 'maxFileSize': {
      const limitKB = presentation?.maxFileSize
      const limitMB = typeof limitKB === 'number' ? convertKBToMB(limitKB) : undefined
      return t.maxFileSize(limitMB)
    }
    case 'accept': {
      const formats = presentation?.accept
      return t.accept(formats)
    }
    // Arrays
    case 'minItems':
      return t.minItems(schema.minItems)
    case 'maxItems':
      return t.maxItems(schema.maxItems)
    case 'uniqueItems':
      return t.uniqueItems
    case 'contains':
      throw new Error('"contains" is not implemented yet')
    case 'minContains':
      throw new Error('"minContains" is not implemented yet')
    case 'maxContains':
      throw new Error('"maxContains" is not implemented yet')
    case 'additionalProperties':
      return t.additionalProperties
    case 'json-logic':
      return customErrorMessage || t.jsonLogicFallback
  }
}

function valueToString(value: SchemaValue): string {
  if (typeof value === 'string') {
    return value
  }
  return JSON.stringify(value)
}
