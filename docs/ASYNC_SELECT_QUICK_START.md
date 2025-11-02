# Async Select Options - Quick Start

Esta guía te ayudará a comenzar rápidamente con async select options en tu formulario.

## Instalación

La funcionalidad está incluida en `@remoteoss/json-schema-form` v1.2.4+. No requiere instalación adicional.

## 3 Pasos para Implementar

### Paso 1: Configura el Schema

Agrega `asyncOptions` a tu campo select:

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
          id: 'countries-loader',  // ID único para identificar el loader
        },
      },
    },
  },
}
```

### Paso 2: Crea el Loader

Define una función que cargue las opciones:

```typescript
import type { AsyncOptionsLoader } from '@remoteoss/json-schema-form'

const countriesLoader: AsyncOptionsLoader = async (context) => {
  // Usa tu método de fetching preferido
  const response = await fetch('/api/countries')
  const data = await response.json()
  
  return {
    options: data.map(country => ({
      label: country.name,
      value: country.code,
    })),
  }
}
```

### Paso 3: Registra el Loader

Pasa el loader al crear el formulario:

```typescript
import { createHeadlessForm } from '@remoteoss/json-schema-form'

const form = createHeadlessForm(schema, {
  asyncLoaders: {
    'countries-loader': countriesLoader,  // El ID debe coincidir
  },
})
```

## Uso en la UI

El campo tiene acceso directo al `loader`:

```typescript
const countryField = form.fields.find(f => f.name === 'country')

// Cargar opciones (pasa formValues)
const result = await countryField.asyncOptions.loader({
  formValues: currentFormValues,
})
console.log(result.options) // [{ label: 'USA', value: 'us' }, ...]
```

## Características Adicionales

### Búsqueda

```typescript
// En el schema
asyncOptions: {
  id: 'countries-loader',
  searchable: true,
}

// En el loader (no cambia)
const countriesLoader: AsyncOptionsLoader = async (context) => {
  const { search } = context
  const response = await fetch(`/api/countries?search=${search || ''}`)
  // ...
}

// En la UI
const result = await field.asyncOptions.loader({
  search: 'united',
  formValues: currentFormValues,
})
```

### Paginación

```typescript
// En el schema
asyncOptions: {
  id: 'products-loader',
  paginated: true,
}

// En el loader
const productsLoader: AsyncOptionsLoader = async (context) => {
  const { pagination } = context
  const page = pagination?.page || 1
  const response = await fetch(`/api/products?page=${page}`)
  const data = await response.json()
  
  return {
    options: data.items,
    pagination: {
      page: data.currentPage,
      hasMore: data.currentPage < data.totalPages,
    },
  }
}

// En la UI
const page1 = await field.asyncOptions.loadOptions(undefined, 1)
const page2 = await field.asyncOptions.loadOptions(undefined, 2)
```

### Campos Dependientes

```typescript
// Schema (igual)
{
  country: {
    type: 'string',
    'x-jsf-presentation': {
      inputType: 'select',
      asyncOptions: { id: 'countries-loader' },
    },
  },
  state: {
    type: 'string',
    'x-jsf-presentation': {
      inputType: 'select',
      asyncOptions: {
        id: 'states-loader',
        dependencies: ['country'],  // Depende del campo country
      },
    },
  },
}

// Loader (igual)
const statesLoader: AsyncOptionsLoader = async (context) => {
  const { formValues } = context
  const countryCode = formValues.country
  
  if (!countryCode) return { options: [] }
  
  const response = await fetch(`/api/states?country=${countryCode}`)
  return { options: await response.json() }
}

// UI - Simple!
function MyForm() {
  const [formValues, setFormValues] = useState({ country: '', state: '' })
  const [stateOptions, setStateOptions] = useState([])
  
  const stateField = form.fields.find(f => f.name === 'state')
  
  useEffect(() => {
    if (!formValues.country) {
      setStateOptions([])
      return
    }
    
    // ✅ Simple: Solo pasa formValues
    stateField.asyncOptions.loader({ formValues })
      .then(result => setStateOptions(result.options))
  }, [formValues.country])
  
  return (
    <div>
      <CountrySelect 
        value={formValues.country}
        onChange={country => setFormValues({ country, state: '' })}
      />
      <StateSelect
        value={formValues.state}
        options={stateOptions}
        disabled={!formValues.country}
        onChange={state => setFormValues(prev => ({ ...prev, state }))}
      />
    </div>
  )
}
```

## Integración con React Select

```typescript
import Select from 'react-select'
import { useState } from 'react'

function AsyncSelectField({ field }) {
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(false)
  
  const loadOptions = async (inputValue) => {
    setLoading(true)
    try {
      const result = await field.asyncOptions.loadOptions(inputValue)
      setOptions(result.options)
      return result.options
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Select
      cacheOptions
      defaultOptions
      loadOptions={loadOptions}
      isLoading={loading}
    />
  )
}
```

## Documentación Completa

Para más información, casos de uso avanzados y best practices, consulta:

📚 **[ASYNC_SELECT.md](./ASYNC_SELECT.md)** - Documentación completa

## Tipos TypeScript

Todos los tipos están exportados desde el paquete principal:

```typescript
import type {
  AsyncOptionsLoader,
  AsyncOptionsLoaderContext,
  AsyncOptionsLoaderResult,
  AsyncOptionsConfig,
  AsyncOptionsPaginationInfo,
} from '@remoteoss/json-schema-form'
```

## Soporte

- **Issues**: [GitHub Issues](https://github.com/remoteoss/json-schema-form/issues)
- **Discusiones**: [GitHub Discussions](https://github.com/remoteoss/json-schema-form/discussions)
