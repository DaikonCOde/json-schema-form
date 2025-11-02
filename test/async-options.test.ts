import type { AsyncOptionsLoader, AsyncOptionsLoaderContext, JsfObjectSchema } from '../src'
import { describe, expect, it, jest } from '@jest/globals'
import { createHeadlessForm } from '../src'

describe('Async Options', () => {
  describe('Basic async options configuration', () => {
    it('should include asyncOptions config in field when loader is provided', () => {
      const schema: JsfObjectSchema = {
        type: 'object',
        properties: {
          country: {
            'type': 'string',
            'title': 'Country',
            'x-jsf-presentation': {
              inputType: 'select',
              asyncOptions: {
                id: 'countries-loader',
                searchable: true,
              },
            },
          },
        },
      }

      const countriesLoader: AsyncOptionsLoader = async () => ({
        options: [
          { label: 'USA', value: 'us' },
          { label: 'Canada', value: 'ca' },
        ],
      })

      const form = createHeadlessForm(schema, {
        asyncLoaders: {
          'countries-loader': countriesLoader,
        },
      })

      const countryField = form.fields.find(f => f.name === 'country')
      expect(countryField?.asyncOptions).toBeDefined()
      expect(countryField?.asyncOptions?.id).toBe('countries-loader')
      expect(countryField?.asyncOptions?.searchable).toBe(true)
      expect(countryField?.asyncOptions?.loader).toBeDefined()
    })

    it('should include config without loadOptions when loader is not provided', () => {
      const schema: JsfObjectSchema = {
        type: 'object',
        properties: {
          country: {
            'type': 'string',
            'title': 'Country',
            'x-jsf-presentation': {
              inputType: 'select',
              asyncOptions: {
                id: 'countries-loader',
                searchable: true,
              },
            },
          },
        },
      }

      const form = createHeadlessForm(schema)

      const countryField = form.fields.find(f => f.name === 'country')
      expect(countryField?.asyncOptions).toBeDefined()
      expect(countryField?.asyncOptions?.id).toBe('countries-loader')
      expect(countryField?.asyncOptions?.loader).toBeUndefined()
    })

    it('should not add static options when asyncOptions is present', () => {
      const schema: JsfObjectSchema = {
        type: 'object',
        properties: {
          country: {
            'type': 'string',
            'title': 'Country',
            'x-jsf-presentation': {
              inputType: 'select',
              asyncOptions: {
                id: 'countries-loader',
              },
            },
          },
        },
      }

      const form = createHeadlessForm(schema, {
        asyncLoaders: {
          'countries-loader': async () => ({
            options: [{ label: 'USA', value: 'us' }],
          }),
        },
      })

      const countryField = form.fields.find(f => f.name === 'country')
      expect(countryField?.options).toBeUndefined()
      expect(countryField?.asyncOptions).toBeDefined()
    })
  })

  describe('Async loader execution', () => {
    it('should call loader with correct context', async () => {
      const schema: JsfObjectSchema = {
        type: 'object',
        properties: {
          country: {
            'type': 'string',
            'title': 'Country',
            'x-jsf-presentation': {
              inputType: 'select',
              asyncOptions: {
                id: 'countries-loader',
                params: {
                  endpoint: '/api/countries',
                },
              },
            },
          },
        },
      }

      const loaderMock = jest.fn(async (context: AsyncOptionsLoaderContext) => {
        return {
          options: [
            { label: 'USA', value: 'us' },
            { label: 'Canada', value: 'ca' },
          ],
        }
      }) as jest.MockedFunction<AsyncOptionsLoader>

      const form = createHeadlessForm(schema, {
        initialValues: { country: 'us' },
        asyncLoaders: {
          'countries-loader': loaderMock,
        },
      })

      const countryField = form.fields.find(f => f.name === 'country')
      const result = await countryField?.asyncOptions?.loader?.({
        search: 'united',
        formValues: { country: 'us' },
      })

      expect(loaderMock).toHaveBeenCalledWith({
        search: 'united',
        pagination: undefined,
        formValues: { country: 'us' },
      })

      expect(result?.options).toHaveLength(2)
      expect(result?.options[0]).toEqual({ label: 'USA', value: 'us' })
    })

    it('should handle pagination context', async () => {
      const schema: JsfObjectSchema = {
        type: 'object',
        properties: {
          country: {
            'type': 'string',
            'title': 'Country',
            'x-jsf-presentation': {
              inputType: 'select',
              asyncOptions: {
                id: 'countries-loader',
                paginated: true,
              },
            },
          },
        },
      }

      const loaderMock = jest.fn(async (context: AsyncOptionsLoaderContext) => {
        return {
          options: [{ label: 'Country 1', value: '1' }],
          pagination: {
            page: context.pagination?.page || 1,
            hasMore: true,
          },
        }
      }) as jest.MockedFunction<AsyncOptionsLoader>

      const form = createHeadlessForm(schema, {
        asyncLoaders: {
          'countries-loader': loaderMock,
        },
      })

      const countryField = form.fields.find(f => f.name === 'country')
      const result = await countryField?.asyncOptions?.loader?.({
        pagination: { page: 2, hasMore: false },
        formValues: {},
      })

      expect(loaderMock).toHaveBeenCalledWith({
        search: undefined,
        pagination: { page: 2, hasMore: false },
        formValues: {},
      })

      expect(result?.pagination?.page).toBe(2)
      expect(result?.pagination?.hasMore).toBe(true)
    })

    it('should propagate loader errors', async () => {
      const schema: JsfObjectSchema = {
        type: 'object',
        properties: {
          country: {
            'type': 'string',
            'title': 'Country',
            'x-jsf-presentation': {
              inputType: 'select',
              asyncOptions: {
                id: 'countries-loader',
              },
            },
          },
        },
      }

      const loaderMock = jest.fn(async () => {
        throw new Error('Network error')
      }) as jest.MockedFunction<AsyncOptionsLoader>

      const form = createHeadlessForm(schema, {
        asyncLoaders: {
          'countries-loader': loaderMock,
        },
      })

      const countryField = form.fields.find(f => f.name === 'country')

      await expect(countryField?.asyncOptions?.loader?.({
        formValues: {},
      })).rejects.toThrow('Network error')
    })
  })

  describe('Async options with dependencies', () => {
    it('should pass current form values to loader for dependent fields', async () => {
      const schema: JsfObjectSchema = {
        type: 'object',
        properties: {
          region: {
            'type': 'string',
            'title': 'Region',
            'x-jsf-presentation': {
              inputType: 'text',
            },
          },
          country: {
            'type': 'string',
            'title': 'Country',
            'x-jsf-presentation': {
              inputType: 'select',
              asyncOptions: {
                id: 'countries-loader',
                dependencies: ['region'],
              },
            },
          },
        },
      }

      const loaderMock = jest.fn(async (context: AsyncOptionsLoaderContext) => {
        const region = context.formValues.region
        return {
          options: region === 'americas'
            ? [{ label: 'USA', value: 'us' }, { label: 'Canada', value: 'ca' }]
            : [{ label: 'UK', value: 'uk' }],
        }
      }) as jest.MockedFunction<AsyncOptionsLoader>

      const form = createHeadlessForm(schema, {
        initialValues: { region: 'americas' },
        asyncLoaders: {
          'countries-loader': loaderMock,
        },
      })

      const countryField = form.fields.find(f => f.name === 'country')

      // Test with current form values from americas
      const result1 = await countryField?.asyncOptions?.loader?.({
        formValues: { region: 'americas' },
      })
      expect(loaderMock).toHaveBeenCalledWith({
        search: undefined,
        pagination: undefined,
        formValues: { region: 'americas' },
      })
      expect(result1?.options).toHaveLength(2)
      expect(result1?.options[0].value).toBe('us')

      // Test with updated form values (europe)
      loaderMock.mockClear()
      const result2 = await countryField?.asyncOptions?.loader?.({
        formValues: { region: 'europe' },
      })
      expect(loaderMock).toHaveBeenCalledWith({
        search: undefined,
        pagination: undefined,
        formValues: { region: 'europe' },
      })
      expect(result2?.options).toHaveLength(1)
      expect(result2?.options[0].value).toBe('uk')
    })
  })

  describe('Nested fields with async options', () => {
    it('should support async options in nested object fields', () => {
      const schema: JsfObjectSchema = {
        type: 'object',
        properties: {
          address: {
            'type': 'object',
            'x-jsf-presentation': {
              inputType: 'fieldset',
            },
            'properties': {
              country: {
                'type': 'string',
                'title': 'Country',
                'x-jsf-presentation': {
                  inputType: 'select',
                  asyncOptions: {
                    id: 'countries-loader',
                  },
                },
              },
            },
          },
        },
      }

      const form = createHeadlessForm(schema, {
        asyncLoaders: {
          'countries-loader': async () => ({
            options: [{ label: 'USA', value: 'us' }],
          }),
        },
      })

      const addressField = form.fields.find(f => f.name === 'address')
      const countryField = addressField?.fields?.find(f => f.name === 'country')

      expect(countryField?.asyncOptions).toBeDefined()
      expect(countryField?.asyncOptions?.loader).toBeDefined()
    })
  })

  describe('Configuration parameters', () => {
    it('should preserve custom params in asyncOptions config', () => {
      const schema: JsfObjectSchema = {
        type: 'object',
        properties: {
          country: {
            'type': 'string',
            'title': 'Country',
            'x-jsf-presentation': {
              inputType: 'select',
              asyncOptions: {
                id: 'countries-loader',
                params: {
                  endpoint: '/api/countries',
                  filter: 'active',
                  limit: 50,
                },
                searchable: true,
                paginated: true,
                debounceMs: 500,
              },
            },
          },
        },
      }

      const form = createHeadlessForm(schema, {
        asyncLoaders: {
          'countries-loader': async () => ({ options: [] }),
        },
      })

      const countryField = form.fields.find(f => f.name === 'country')
      expect(countryField?.asyncOptions?.params).toEqual({
        endpoint: '/api/countries',
        filter: 'active',
        limit: 50,
      })
      expect(countryField?.asyncOptions?.searchable).toBe(true)
      expect(countryField?.asyncOptions?.paginated).toBe(true)
      expect(countryField?.asyncOptions?.debounceMs).toBe(500)
    })
  })
})
