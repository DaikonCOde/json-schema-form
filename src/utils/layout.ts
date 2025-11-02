import type { Field } from '../field/type'
import type { JsfLayoutConfig, ResponsiveFieldConfig } from '../types'
/**
 * Default layout configuration values
 */
export const DEFAULT_LAYOUT_CONFIG: Required<Pick<JsfLayoutConfig, 'type' | 'columns' | 'gap'>> = {
  type: 'columns',
  columns: 1,
  gap: '16px',
}

/**
 * Validates a layout configuration object
 * @param layout - The layout configuration to validate
 * @returns Whether the layout configuration is valid
 */
export function isValidLayoutConfig(layout: any): layout is JsfLayoutConfig {
  if (!layout || typeof layout !== 'object') {
    return false
  }

  // Validate type
  if (layout.type && layout.type !== 'columns') {
    return false
  }

  // Validate columns
  if (layout.columns !== undefined && (!Number.isInteger(layout.columns) || layout.columns < 1)) {
    return false
  }

  // Validate gap
  if (layout.gap && typeof layout.gap !== 'string') {
    return false
  }

  // Validate responsive config
  if (layout.responsive) {
    const responsiveKeys = ['sm', 'md', 'lg', 'xl']
    for (const key of responsiveKeys) {
      const value = layout.responsive[key]
      if (value !== undefined && (!Number.isInteger(value) || value < 1)) {
        return false
      }
    }
  }

  // Validate col span/start/end (can be number or responsive object)
  const colProps = ['colSpan', 'colStart', 'colEnd'] as const
  for (const prop of colProps) {
    const value = layout[prop]
    if (value !== undefined) {
      if (typeof value === 'number') {
        if (!Number.isInteger(value) || value < 1) {
          return false
        }
      }
      else if (typeof value === 'object' && value !== null) {
        // Validate responsive object
        const responsiveKeys = ['sm', 'md', 'lg', 'xl'] as const
        for (const key of responsiveKeys) {
          const responsiveValue = value[key]
          if (responsiveValue !== undefined && (!Number.isInteger(responsiveValue) || responsiveValue < 1)) {
            return false
          }
        }
      }
      else {
        return false
      }
    }
  }

  return true
}

/**
 * Normalizes a layout configuration by merging with defaults
 * @param layout - The layout configuration to normalize
 * @returns Normalized layout configuration
 */
export function normalizeLayoutConfig(layout?: JsfLayoutConfig): JsfLayoutConfig {
  if (!layout || !isValidLayoutConfig(layout)) {
    return DEFAULT_LAYOUT_CONFIG
  }

  return {
    ...DEFAULT_LAYOUT_CONFIG,
    ...layout,
  }
}

/**
 * Extracts layout information from a field for easier consumption by UI libraries
 * @param field - The field to extract layout from
 * @returns Layout information or null if no layout is configured
 */
export function getFieldLayoutInfo(field: Field): JsfLayoutConfig | null {
  return field.layout || null
}

/**
 * Extracts root container layout information from any field in a form
 * @param field - Any field from the form
 * @returns Root container layout information or null if no layout is configured
 */
export function getRootLayoutInfo(field: Field): JsfLayoutConfig | null {
  return field._rootLayout || null
}

/**
 * Gets the effective layout for a form container by checking the first field's root layout
 * @param fields - Array of fields from createHeadlessForm
 * @returns Container layout information or null
 */
export function getFormContainerLayout(fields: Field[]): JsfLayoutConfig | null {
  if (!fields.length) {
    return null
  }
  return getRootLayoutInfo(fields[0])
}

/**
 * Generates CSS Grid style properties from layout configuration
 * @param layout - The layout configuration
 * @returns CSS properties object for CSS Grid
 */
export function generateCSSGridProperties(layout: JsfLayoutConfig): Record<string, string> {
  const normalized = normalizeLayoutConfig(layout)
  const properties: Record<string, string> = {}

  // Basic grid setup
  if (normalized.type === 'columns') {
    properties.display = 'grid'
    properties.gridTemplateColumns = `repeat(${normalized.columns}, 1fr)`

    if (normalized.gap) {
      properties.gap = normalized.gap
    }
  }

  // Individual field properties
  if (layout.colSpan) {
    if (typeof layout.colSpan === 'number') {
      properties.gridColumn = `span ${layout.colSpan}`
    }
    else {
      // For responsive colSpan, use the largest value as default
      const values = Object.values(layout.colSpan).filter(v => typeof v === 'number') as number[]
      if (values.length > 0) {
        const maxValue = Math.max(...values)
        properties.gridColumn = `span ${maxValue}`
      }
    }
  }

  // Handle colStart/colEnd (simplified for now - can be extended for responsive)
  const colStart = typeof layout.colStart === 'number' ? layout.colStart : undefined
  const colEnd = typeof layout.colEnd === 'number' ? layout.colEnd : undefined

  if (colStart && colEnd) {
    properties.gridColumn = `${colStart} / ${colEnd}`
  }
  else if (colStart) {
    properties.gridColumnStart = `${colStart}`
  }
  else if (colEnd) {
    properties.gridColumnEnd = `${colEnd}`
  }

  return properties
}

/**
 * Generates responsive CSS media queries for layout
 * @param layout - The layout configuration with responsive settings
 * @param breakpoints - Custom breakpoints (optional)
 * @returns CSS media query string
 */
export function generateResponsiveCSS(
  layout: JsfLayoutConfig,
  breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
): string {
  if (!layout.responsive) {
    return ''
  }

  const mediaQueries: string[] = []

  Object.entries(layout.responsive).forEach(([breakpoint, columns]) => {
    if (columns && breakpoints[breakpoint as keyof typeof breakpoints]) {
      const minWidth = breakpoints[breakpoint as keyof typeof breakpoints]
      mediaQueries.push(`@media (min-width: ${minWidth}) { grid-template-columns: repeat(${columns}, 1fr); }`)
    }
  })

  return mediaQueries.join('\n')
}

/**
 * Generates responsive CSS media queries for individual field properties
 * @param layout - The field layout configuration with responsive settings
 * @param breakpoints - Custom breakpoints (optional)
 * @returns CSS media query string for individual fields
 */
export function generateResponsiveFieldCSS(
  layout: JsfLayoutConfig,
  breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
): string {
  const mediaQueries: string[] = []

  // Handle responsive colSpan
  if (layout.colSpan && typeof layout.colSpan === 'object') {
    Object.entries(layout.colSpan).forEach(([breakpoint, span]) => {
      if (span && breakpoints[breakpoint as keyof typeof breakpoints]) {
        const minWidth = breakpoints[breakpoint as keyof typeof breakpoints]
        mediaQueries.push(`@media (min-width: ${minWidth}) { grid-column: span ${span}; }`)
      }
    })
  }

  // Handle responsive colStart
  if (layout.colStart && typeof layout.colStart === 'object') {
    Object.entries(layout.colStart).forEach(([breakpoint, start]) => {
      if (start && breakpoints[breakpoint as keyof typeof breakpoints]) {
        const minWidth = breakpoints[breakpoint as keyof typeof breakpoints]
        mediaQueries.push(`@media (min-width: ${minWidth}) { grid-column-start: ${start}; }`)
      }
    })
  }

  // Handle responsive colEnd
  if (layout.colEnd && typeof layout.colEnd === 'object') {
    Object.entries(layout.colEnd).forEach(([breakpoint, end]) => {
      if (end && breakpoints[breakpoint as keyof typeof breakpoints]) {
        const minWidth = breakpoints[breakpoint as keyof typeof breakpoints]
        mediaQueries.push(`@media (min-width: ${minWidth}) { grid-column-end: ${end}; }`)
      }
    })
  }

  return mediaQueries.join('\n')
}

/**
 * Utility function to get the base (non-responsive) value from a field property
 * @param value - The field property value (can be number or responsive object)
 * @returns The base value or undefined
 */
export function getBaseFieldValue(value: number | ResponsiveFieldConfig | undefined): number | undefined {
  if (typeof value === 'number') {
    return value
  }
  if (typeof value === 'object' && value !== null) {
    // Return the largest value as base, or the last defined value
    const values = Object.values(value).filter(v => typeof v === 'number') as number[]
    return values.length > 0 ? Math.max(...values) : undefined
  }
  return undefined
}
