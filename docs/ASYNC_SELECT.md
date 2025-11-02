# Async Select Options

La funcionalidad de **Async Select Options** permite cargar las opciones de un campo `select` de forma asíncrona desde servicios externos, APIs o cualquier fuente de datos remota.

## Características

- ✅ **Agnóstico del fetching**: Usa tu propia herramienta (fetch, axios, etc.)
- ✅ **Soporte para búsqueda**: Filtrado de opciones mientras el usuario escribe
- ✅ **Paginación**: Carga de opciones en páginas para grandes datasets
- ✅ **Dependencias entre campos**: Opciones que dependen de otros valores del formulario
- ✅ **Manejo de errores**: Propagación de errores para que la UI pueda manejarlos
- ✅ **TypeScript**: Tipos completos para autocompletado y seguridad de tipos
- ✅ **Nested fields**: Soporte para campos anidados en objetos y arrays

## Configuración Básica

### 1. Definir el schema con asyncOptions

En el JSON Schema, configura el campo con `x-jsf-presentation.asyncOptions`:

```typescript
const schema = {
  type: 'object',
  properties: {
    country: {
      type: 'string',
      title: 'Country',
      'x-jsf-presentation': {
        inputType: 'select',
        asyncOptions: {
          id: 'countries-loader',  // ID único del loader
          searchable: true,         // Opcional: habilitar búsqueda
        },
      },
    },
  },
}
```

### 2. Implementar el loader

Crea una función que cargue las opciones:

```typescript
import type { AsyncOptionsLoader } from '@remoteoss/json-schema-form'

const countriesLoader: AsyncOptionsLoader = async (context) => {
  const { search, formValues } = context
  
  // Usa tu herramienta de fetching preferida
  const response = await fetch(`/api/countries?search=${search || ''}`)
  const data = await response.json()
  
  return {
    options: data.map(country => ({
      label: country.name,
      value: country.code,
    })),
  }
}
```

### 3. Registrar el loader en el formulario

Pasa el loader al crear el formulario:

```typescript
import { createHeadlessForm } from '@remoteoss/json-schema-form'

const form = createHeadlessForm(schema, {
  asyncLoaders: {
    'countries-loader': countriesLoader,  // ID debe coincidir con el schema
  },
})
```

### 4. Usar el loader en tu UI

El campo tendrá acceso directo al `loader`:

```typescript
const countryField = form.fields.find(f => f.name === 'country')

// Cargar opciones (pasa formValues actual)
const result = await countryField.asyncOptions.loader({
  formValues: currentFormValues,  // ← Siempre pasa los valores actuales
})
console.log(result.options) // [{ label: 'USA', value: 'us' }, ...]

// Con búsqueda
const searchResult = await countryField.asyncOptions.loader({
  search: 'united',
  formValues: currentFormValues,
})
console.log(searchResult.options) // [{ label: 'United States', value: 'us' }, ...]
```

## Casos de Uso Avanzados

### Búsqueda con Debounce

El schema puede especificar un tiempo de debounce:

```typescript
const schema = {
  type: 'object',
  properties: {
    city: {
      type: 'string',
      title: 'City',
      'x-jsf-presentation': {
        inputType: 'select',
        asyncOptions: {
          id: 'cities-loader',
          searchable: true,
          debounceMs: 500,  // Esperar 500ms antes de buscar
        },
      },
    },
  },
}
```

La implementación del debounce debe hacerse en la UI. El valor `debounceMs` es solo una configuración sugerida.

### Paginación

Para grandes datasets, puedes habilitar paginación:

```typescript
const schema = {
  type: 'object',
  properties: {
    product: {
      type: 'string',
      title: 'Product',
      'x-jsf-presentation': {
        inputType: 'select',
        asyncOptions: {
          id: 'products-loader',
          paginated: true,
        },
      },
    },
  },
}
```

Implementación del loader con paginación:

```typescript
const productsLoader: AsyncOptionsLoader = async (context) => {
  const { search, pagination } = context
  const page = pagination?.page || 1
  const limit = 20
  
  const response = await fetch(
    `/api/products?search=${search || ''}&page=${page}&limit=${limit}`
  )
  const data = await response.json()
  
  return {
    options: data.items.map(product => ({
      label: product.name,
      value: product.id,
    })),
    pagination: {
      page: data.currentPage,
      hasMore: data.currentPage < data.totalPages,
      totalPages: data.totalPages,
    },
  }
}
```

Uso en la UI:

```typescript
// Cargar página 1
const page1 = await productField.asyncOptions.loadOptions(undefined, 1)

// Cargar página 2
const page2 = await productField.asyncOptions.loadOptions(undefined, 2)

// Verificar si hay más páginas
if (page2.hasMore) {
  // Cargar siguiente página...
}
```

### Dependencias entre Campos

Las opciones pueden depender de otros campos del formulario:

```typescript
const schema = {
  type: 'object',
  properties: {
    country: {
      type: 'string',
      title: 'Country',
      'x-jsf-presentation': {
        inputType: 'select',
        asyncOptions: {
          id: 'countries-loader',
        },
      },
    },
    state: {
      type: 'string',
      title: 'State',
      'x-jsf-presentation': {
        inputType: 'select',
        asyncOptions: {
          id: 'states-loader',
          dependencies: ['country'],  // Indica que depende del campo country
        },
      },
    },
  },
}
```

Implementación del loader dependiente:

```typescript
const statesLoader: AsyncOptionsLoader = async (context) => {
  const { formValues } = context
  const countryCode = formValues.country
  
  // Si no hay país seleccionado, retornar vacío
  if (!countryCode) {
    return { options: [] }
  }
  
  const response = await fetch(`/api/states?country=${countryCode}`)
  const data = await response.json()
  
  return {
    options: data.map(state => ({
      label: state.name,
      value: state.code,
    })),
  }
}
```

**Ejemplo completo de UI con React**:

```typescript
import { useState, useEffect } from 'react'

function DependentSelectsForm() {
  // Estado del formulario
  const [formValues, setFormValues] = useState({
    country: '',
    state: '',
  })
  
  // Opciones de los selects
  const [countryOptions, setCountryOptions] = useState([])
  const [stateOptions, setStateOptions] = useState([])
  const [loadingStates, setLoadingStates] = useState(false)
  
  const countryField = form.fields.find(f => f.name === 'country')
  const stateField = form.fields.find(f => f.name === 'state')
  
  // Cargar países al montar
  useEffect(() => {
    countryField?.asyncOptions?.loader?.({ formValues: {} })
      .then(result => setCountryOptions(result.options))
  }, [])
  
  // Cargar estados cuando cambie el país
  useEffect(() => {
    async function loadStates() {
      if (!formValues.country) {
        setStateOptions([])
        return
      }
      
      setLoadingStates(true)
      try {
        // ✅ Simple: Solo pasa formValues actual
        const result = await stateField?.asyncOptions?.loader?.({
          formValues,  // ← valores actuales (siempre)
        })
        setStateOptions(result?.options || [])
      } catch (error) {
        console.error('Error loading states:', error)
        setStateOptions([])
      } finally {
        setLoadingStates(false)
      }
    }
    
    loadStates()
  }, [formValues.country])  // Re-ejecutar cuando cambie country
  
  return (
    <div>
      {/* Select de país */}
      <select
        value={formValues.country}
        onChange={(e) => setFormValues(prev => ({
          ...prev,
          country: e.target.value,
          state: '',  // Resetear state cuando cambie country
        }))}
      >
        <option value="">Select a country</option>
        {countryOptions.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      
      {/* Select de estado (dependiente) */}
      <select
        value={formValues.state}
        onChange={(e) => setFormValues(prev => ({
          ...prev,
          state: e.target.value,
        }))}
        disabled={!formValues.country || loadingStates}
      >
        <option value="">Select a state</option>
        {loadingStates && <option>Loading...</option>}
        {stateOptions.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
```

**Resumen clave**:
1. El loader está disponible en `field.asyncOptions.loader`
2. Siempre pasa un objeto con `formValues` actuales
3. Ejemplo: `loader({ formValues: currentState })`
4. Para búsqueda: `loader({ search: 'query', formValues: currentState })`

### Parámetros Personalizados

Puedes pasar parámetros adicionales en el schema:

```typescript
const schema = {
  type: 'object',
  properties: {
    user: {
      type: 'string',
      title: 'User',
      'x-jsf-presentation': {
        inputType: 'select',
        asyncOptions: {
          id: 'users-loader',
          params: {
            endpoint: '/api/users',
            role: 'admin',
            includeInactive: false,
          },
        },
      },
    },
  },
}
```

Acceso a los parámetros en el loader:

```typescript
const usersLoader: AsyncOptionsLoader = async (context) => {
  const field = form.fields.find(f => f.name === 'user')
  const params = field?.asyncOptions?.params
  
  const url = new URL(params.endpoint, window.location.origin)
  url.searchParams.set('role', params.role)
  url.searchParams.set('includeInactive', params.includeInactive.toString())
  
  const response = await fetch(url.toString())
  const data = await response.json()
  
  return {
    options: data.map(user => ({
      label: user.name,
      value: user.id,
      email: user.email,  // Propiedades adicionales
    })),
  }
}
```

### Manejo de Errores

Los errores son propagados a la UI:

```typescript
const usersLoader: AsyncOptionsLoader = async (context) => {
  const response = await fetch('/api/users')
  
  if (!response.ok) {
    throw new Error(`Failed to load users: ${response.statusText}`)
  }
  
  return {
    options: await response.json(),
  }
}
```

En la UI, maneja el error:

```typescript
try {
  const result = await userField.asyncOptions.loadOptions()
  setOptions(result.options)
  setError(null)
} catch (error) {
  setError(error.message)
  setOptions([])
}
```

### Abort Controller (Cancelación de Requests)

Puedes usar `AbortController` para cancelar requests pendientes:

```typescript
const usersLoader: AsyncOptionsLoader = async (context) => {
  const { signal } = context
  
  const response = await fetch('/api/users', { signal })
  
  return {
    options: await response.json(),
  }
}
```

En la UI:

```typescript
let abortController = null

async function loadOptions(search) {
  // Cancelar request anterior
  if (abortController) {
    abortController.abort()
  }
  
  abortController = new AbortController()
  
  try {
    // Nota: necesitas modificar el loader para aceptar signal externamente
    const result = await userField.asyncOptions.loadOptions(search)
    setOptions(result.options)
  } catch (error) {
    if (error.name !== 'AbortError') {
      setError(error.message)
    }
  }
}
```

### Campos Anidados

Los async options funcionan en campos anidados:

```typescript
const schema = {
  type: 'object',
  properties: {
    address: {
      type: 'object',
      'x-jsf-presentation': {
        inputType: 'fieldset',
      },
      properties: {
        country: {
          type: 'string',
          title: 'Country',
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
    'countries-loader': countriesLoader,
  },
})

// Acceso al campo anidado
const addressField = form.fields.find(f => f.name === 'address')
const countryField = addressField.fields.find(f => f.name === 'country')

const options = await countryField.asyncOptions.loadOptions()
```

## Integración con UI Libraries

### React + React Select

```typescript
import Select from 'react-select'
import { useCallback, useState } from 'react'

function AsyncSelectField({ field }) {
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(false)
  
  const loadOptions = useCallback(async (inputValue) => {
    if (!field.asyncOptions?.loadOptions) return []
    
    setLoading(true)
    try {
      const result = await field.asyncOptions.loadOptions(inputValue)
      setOptions(result.options)
      return result.options
    } catch (error) {
      console.error('Failed to load options:', error)
      return []
    } finally {
      setLoading(false)
    }
  }, [field])
  
  return (
    <Select
      cacheOptions
      defaultOptions
      loadOptions={loadOptions}
      isLoading={loading}
      placeholder={`Select ${field.label}...`}
    />
  )
}
```

### Vue + Vue Select

```vue
<template>
  <v-select
    v-model="value"
    :options="options"
    :loading="loading"
    :filterable="false"
    @search="onSearch"
    @open="onOpen"
  />
</template>

<script setup>
import { ref } from 'vue'
import vSelect from 'vue-select'

const props = defineProps(['field'])
const options = ref([])
const loading = ref(false)
const value = ref(null)

async function loadOptions(search = '') {
  if (!props.field.asyncOptions?.loadOptions) return
  
  loading.value = true
  try {
    const result = await props.field.asyncOptions.loadOptions(search)
    options.value = result.options
  } catch (error) {
    console.error('Failed to load options:', error)
  } finally {
    loading.value = false
  }
}

function onSearch(search, loading) {
  if (search) {
    loadOptions(search)
  }
}

function onOpen() {
  if (options.value.length === 0) {
    loadOptions()
  }
}
</script>
```

## TypeScript Types

### AsyncOptionsConfig

Configuración en el schema:

```typescript
interface AsyncOptionsConfig {
  /** Unique identifier for the async loader */
  id: string
  /** Optional parameters to pass to the loader */
  params?: Record<string, unknown>
  /** Field names that this select depends on */
  dependencies?: string[]
  /** Whether to enable search functionality */
  searchable?: boolean
  /** Whether to enable pagination */
  paginated?: boolean
  /** Debounce time in milliseconds for search */
  debounceMs?: number
}
```

### AsyncOptionsLoader

Firma de la función loader:

```typescript
type AsyncOptionsLoader = (
  context: AsyncOptionsLoaderContext
) => Promise<AsyncOptionsLoaderResult>
```

### AsyncOptionsLoaderContext

Contexto proporcionado al loader:

```typescript
interface AsyncOptionsLoaderContext {
  /** Current search query (if any) */
  search?: string
  /** Current pagination info */
  pagination?: AsyncOptionsPaginationInfo
  /** Current form values (useful for dependent fields) */
  formValues: ObjectValue
  /** Signal for aborting the request */
  signal?: AbortSignal
}
```

### AsyncOptionsLoaderResult

Resultado esperado del loader:

```typescript
interface AsyncOptionsLoaderResult {
  /** Array of options to display */
  options: Array<{
    label: string
    value: unknown
    [key: string]: unknown  // Propiedades adicionales
  }>
  /** Optional pagination info for the next load */
  pagination?: AsyncOptionsPaginationInfo
}
```

### AsyncOptionsPaginationInfo

Información de paginación:

```typescript
interface AsyncOptionsPaginationInfo {
  /** Current page number */
  page: number
  /** Total number of pages available */
  totalPages?: number
  /** Whether there are more pages to load */
  hasMore?: boolean
}
```

## Best Practices

### 1. Caché de Opciones

Implementa caché en la UI para evitar llamadas repetidas:

```typescript
const cache = new Map()

async function loadOptionsWithCache(field, search = '') {
  const cacheKey = `${field.name}:${search}`
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }
  
  const result = await field.asyncOptions.loadOptions(search)
  cache.set(cacheKey, result)
  
  return result
}
```

### 2. Loading States

Muestra estados de carga en la UI:

```typescript
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)

async function load() {
  setLoading(true)
  setError(null)
  
  try {
    const result = await field.asyncOptions.loadOptions()
    setOptions(result.options)
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}
```

### 3. Optimización de Búsquedas

Implementa debounce en la UI para búsquedas:

```typescript
import { debounce } from 'lodash'

const debouncedLoad = debounce(async (search) => {
  const result = await field.asyncOptions.loadOptions(search)
  setOptions(result.options)
}, field.asyncOptions.debounceMs || 300)

function onSearchChange(search) {
  debouncedLoad(search)
}
```

### 4. Manejo de Valores Iniciales

Carga la opción inicial si hay un valor pre-seleccionado:

```typescript
useEffect(() => {
  async function loadInitialOption() {
    if (initialValue && !options.find(o => o.value === initialValue)) {
      // Cargar la opción correspondiente al valor inicial
      const response = await fetch(`/api/options/${initialValue}`)
      const option = await response.json()
      
      setOptions(prev => [...prev, option])
    }
  }
  
  loadInitialOption()
}, [initialValue])
```

### 5. Revalidación en Dependencias

Recarga opciones cuando cambien las dependencias:

```typescript
function DependentSelect({ field, formValues, onChange }) {
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Recargar opciones cuando cambien las dependencias
  useEffect(() => {
    async function loadDependentOptions() {
      if (!field.asyncOptions?.loadOptions) return
      
      // Verificar si todas las dependencias tienen valor
      const allDependenciesHaveValue = field.asyncOptions.dependencies?.every(
        dep => formValues[dep] != null
      )
      
      if (!allDependenciesHaveValue) {
        setOptions([])
        return
      }
      
      setLoading(true)
      try {
        // IMPORTANTE: Pasar formValues actuales como tercer parámetro
        const result = await field.asyncOptions.loadOptions(
          undefined,  // search
          undefined,  // page
          formValues  // ← formValues actuales
        )
        setOptions(result.options)
      } catch (error) {
        console.error('Failed to load options:', error)
        setOptions([])
      } finally {
        setLoading(false)
      }
    }
    
    loadDependentOptions()
  }, [
    // Re-ejecutar cuando cambien las dependencias
    ...(field.asyncOptions?.dependencies?.map(dep => formValues[dep]) || [])
  ])
  
  return (
    <select value={formValues[field.name]} onChange={onChange} disabled={loading}>
      {loading && <option>Loading...</option>}
      {!loading && options.length === 0 && <option>No options</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
```

## Limitaciones y Consideraciones

1. **No hay caché automático**: La librería no implementa caché. Debes implementarlo en la UI si lo necesitas.

2. **Loader sin vincular**: Si no proporcionas un loader para un `asyncOptions.id`, el campo tendrá la configuración pero no la función `loadOptions`.

3. **Mutually exclusive**: Un campo no puede tener `options` estáticas y `asyncOptions` al mismo tiempo. Si defines `asyncOptions`, las opciones estáticas del schema (oneOf, anyOf, enum) son ignoradas.

4. **formValues dinámicos**: Los `formValues` por defecto son los valores al momento de crear el formulario. Para campos con dependencias, **debes pasar los valores actuales** como tercer parámetro de `loadOptions(search, page, currentFormValues)`. Ver ejemplos en la sección "Dependencias entre Campos".

5. **AbortSignal**: El `signal` en el contexto del loader está disponible pero no se usa automáticamente. Debes pasarlo explícitamente a tu función de fetching.

## Migración desde Opciones Estáticas

Si tienes un campo con opciones estáticas:

```typescript
// Antes
{
  country: {
    type: 'string',
    oneOf: [
      { const: 'us', title: 'USA' },
      { const: 'ca', title: 'Canada' },
    ],
  },
}
```

Migrando a async options:

```typescript
// Después
{
  country: {
    type: 'string',
    'x-jsf-presentation': {
      inputType: 'select',
      asyncOptions: {
        id: 'countries-loader',
      },
    },
  },
}

// Y el loader
const countriesLoader = async () => ({
  options: [
    { label: 'USA', value: 'us' },
    { label: 'Canada', value: 'ca' },
  ],
})
```

## Troubleshooting

### El campo no tiene asyncOptions

Verifica que:
1. El schema tenga `x-jsf-presentation.asyncOptions` configurado
2. El `asyncOptions.id` no esté vacío
3. El loader esté registrado con el mismo ID en `asyncLoaders`

### loadOptions es undefined

Esto ocurre cuando no se proporciona el loader. Verifica que el ID del loader coincida con el del schema.

### Errores de tipos TypeScript

Asegúrate de importar los tipos:

```typescript
import type {
  AsyncOptionsLoader,
  AsyncOptionsLoaderContext,
  AsyncOptionsLoaderResult,
} from '@remoteoss/json-schema-form'
```

### Los formValues no se actualizan en dependencias

**Solución**: Pasa los valores actuales del formulario como tercer parámetro:

```typescript
// ❌ Incorrecto - usa valores iniciales
await field.asyncOptions.loadOptions()

// ✅ Correcto - usa valores actuales
await field.asyncOptions.loadOptions(undefined, undefined, currentFormValues)
```

Ejemplo completo:

```typescript
const [formValues, setFormValues] = useState(initialValues)

useEffect(() => {
  // Cuando cambie el campo del que depende
  if (field.asyncOptions?.dependencies?.includes('country')) {
    field.asyncOptions.loadOptions(undefined, undefined, formValues)
      .then(result => setOptions(result.options))
  }
}, [formValues.country])
```

## Ejemplos Completos

Ver la carpeta `examples/` en el repositorio para ejemplos completos con diferentes frameworks:

- `examples/react-async-select/` - Integración con React y React Select
- `examples/vue-async-select/` - Integración con Vue y Vue Select
- `examples/pagination/` - Implementación de paginación
- `examples/dependent-selects/` - Selects dependientes
