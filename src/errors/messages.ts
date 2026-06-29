import type { SchemaValidationErrorType } from '.'
import type { JsfSchemaType, NonBooleanJsfSchema, SchemaValue } from '../types'
import { randexp } from 'randexp'
import { convertKBToMB } from '../utils'
import { DATE_FORMAT } from '../validation/custom/date'

/**
 * Supported locales for built-in validation error messages.
 * `en` is the default and keeps the original (upstream) wording.
 */
export type Locale = 'en' | 'es'

/**
 * Per-locale table of message templates. The branching LOGIC lives in
 * `getErrorMessage`; each entry only owns the wording (and its own pluralization
 * / interpolation), so adding a language is just one more table.
 */
interface ErrorMessageTable {
  checkboxAck: string
  required: string
  forbidden: string
  constValue: (value: string) => string
  optionInvalid: (value: string) => string
  not: string
  minLength: (n: number | undefined) => string
  maxLength: (n: number | undefined) => string
  pattern: (example: string) => string
  formatEmail: string
  formatDate: (format: string, example: string) => string
  formatOther: (format: string) => string
  multipleOf: (n: unknown) => string
  maximum: (n: unknown) => string
  exclusiveMaximum: (n: unknown) => string
  minimum: (n: unknown) => string
  exclusiveMinimum: (n: unknown) => string
  minDate: (date: unknown) => string
  maxDate: (date: unknown) => string
  fileStructure: string
  maxFileSize: (limitMB: number | undefined) => string
  accept: (formats: unknown) => string
  minItems: (n: number | undefined) => string
  maxItems: (n: number | undefined) => string
  uniqueItems: string
  additionalProperties: string
  jsonLogicFallback: string
  /** Full `type` error message (owns its own article/gender quirks per locale). */
  typeError: (schemaType: JsfSchemaType | JsfSchemaType[] | undefined) => string
}

const EN: ErrorMessageTable = {
  checkboxAck: 'Please acknowledge this field',
  required: 'Required field',
  forbidden: 'Not allowed',
  constValue: value => `The only accepted value is ${value}.`,
  optionInvalid: value => `The option "${value}" is not valid.`,
  not: 'The value must not satisfy the provided schema',
  minLength: n => `Please insert at least ${n} characters`,
  maxLength: n => `Please insert up to ${n} characters`,
  pattern: example => `Must have a valid format. E.g. ${example}`,
  formatEmail: 'Please enter a valid email address',
  formatDate: (format, example) => `Must be a valid date in ${format} format. e.g. ${example}`,
  formatOther: format => `Must be a valid ${format} format`,
  multipleOf: n => `Must be a multiple of ${n}`,
  maximum: n => `Must be smaller or equal to ${n}`,
  exclusiveMaximum: n => `Must be smaller than ${n}`,
  minimum: n => `Must be greater or equal to ${n}`,
  exclusiveMinimum: n => `Must be greater than ${n}`,
  minDate: date => `The date must be ${date} or after.`,
  maxDate: date => `The date must be ${date} or before.`,
  fileStructure: 'Not a valid file.',
  maxFileSize: limitMB => `File size too large.${limitMB ? ` The limit is ${limitMB} MB.` : ''}`,
  accept: formats => `Unsupported file format.${formats ? ` The acceptable formats are ${formats}.` : ''}`,
  minItems: n => `Must have at least ${n} ${n === 1 ? 'item' : 'items'}`,
  maxItems: n => `Must have at most ${n} ${n === 1 ? 'item' : 'items'}`,
  uniqueItems: 'Items must be unique',
  additionalProperties: 'Additional property is not allowed',
  jsonLogicFallback: 'The value is not valid',
  typeError: (schemaType) => {
    if (Array.isArray(schemaType)) {
      // Map 'integer' to 'number' in error messages
      const formattedTypes = schemaType.map(type => (type === 'integer' ? 'number' : type))
      return `The value must be a ${formattedTypes.join(' or ')}`
    }
    switch (schemaType) {
      case 'number':
      case 'integer':
        return 'The value must be a number'
      case 'boolean':
        return 'The value must be a boolean'
      case 'null':
        return 'The value must be null'
      case 'string':
        return 'The value must be a string'
      case 'object':
        return 'The value must be an object'
      case 'array':
        return 'The value must be an array'
      default:
        return schemaType ? `The value must be ${schemaType}` : 'Invalid value'
    }
  },
}

const ES: ErrorMessageTable = {
  checkboxAck: 'Tenés que confirmar este campo',
  required: 'Campo obligatorio',
  forbidden: 'No está permitido',
  constValue: value => `El único valor aceptado es ${value}.`,
  optionInvalid: value => `La opción "${value}" no es válida.`,
  not: 'El valor no debe cumplir con el esquema indicado',
  minLength: n => `Ingresá al menos ${n} caracteres`,
  maxLength: n => `Ingresá como máximo ${n} caracteres`,
  pattern: example => `El formato no es válido. Ej.: ${example}`,
  formatEmail: 'Ingresá un email válido',
  formatDate: (format, example) => `Tiene que ser una fecha válida en formato ${format}. Ej.: ${example}`,
  formatOther: format => `Tiene que tener un formato ${format} válido`,
  multipleOf: n => `Tiene que ser múltiplo de ${n}`,
  maximum: n => `Tiene que ser menor o igual a ${n}`,
  exclusiveMaximum: n => `Tiene que ser menor que ${n}`,
  minimum: n => `Tiene que ser mayor o igual a ${n}`,
  exclusiveMinimum: n => `Tiene que ser mayor que ${n}`,
  minDate: date => `La fecha tiene que ser ${date} o posterior.`,
  maxDate: date => `La fecha tiene que ser ${date} o anterior.`,
  fileStructure: 'El archivo no es válido.',
  maxFileSize: limitMB => `El archivo es demasiado grande.${limitMB ? ` El límite es ${limitMB} MB.` : ''}`,
  accept: formats => `Formato de archivo no admitido.${formats ? ` Los formatos aceptados son ${formats}.` : ''}`,
  minItems: n => `Tiene que tener al menos ${n} ${n === 1 ? 'elemento' : 'elementos'}`,
  maxItems: n => `Tiene que tener como máximo ${n} ${n === 1 ? 'elemento' : 'elementos'}`,
  uniqueItems: 'Los elementos no pueden repetirse',
  additionalProperties: 'No se permiten propiedades adicionales',
  jsonLogicFallback: 'El valor no es válido',
  // "de tipo X" esquiva el género del artículo (un/una) y funciona para el join "texto o número".
  typeError: (schemaType) => {
    const name = (type: string): string => {
      switch (type) {
        case 'number':
        case 'integer':
          return 'número'
        case 'boolean':
          return 'booleano'
        case 'null':
          return 'nulo'
        case 'string':
          return 'texto'
        case 'object':
          return 'objeto'
        case 'array':
          return 'lista'
        default:
          return type
      }
    }
    if (Array.isArray(schemaType)) {
      return `El valor tiene que ser de tipo ${schemaType.map(type => name(String(type))).join(' o ')}`
    }
    if (schemaType === undefined) {
      return 'Valor inválido'
    }
    return `El valor tiene que ser de tipo ${name(String(schemaType))}`
  },
}

const TABLES: Record<Locale, ErrorMessageTable> = { en: EN, es: ES }

function getTable(locale: Locale): ErrorMessageTable {
  return TABLES[locale] ?? EN
}

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
