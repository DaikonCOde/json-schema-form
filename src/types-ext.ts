import type { ObjectValue } from './types'

/**
 * [fork] Fork-only type extensions (async options + responsive layout).
 *
 * These types have no upstream counterpart, so keeping them in their own module
 * means `src/types.ts` (a file upstream edits often) only re-exports them and
 * carries a single `asyncOptions?` line. See MAINTAINING.md.
 */

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
  options: Array<{ label: string, value: unknown, [key: string]: unknown }>
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
