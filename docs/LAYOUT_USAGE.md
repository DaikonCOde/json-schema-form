# Layout de Columnas - Guía de Uso

Esta funcionalidad permite definir layouts de columnas responsivas para formularios usando la propiedad `x-jsf-layout`.

## Configuración Básica

### Layout de Formulario Completo

```typescript
import { createHeadlessForm } from '@remoteoss/json-schema-form'

const schema = {
  type: 'object',
  // Configuración de layout para todo el formulario
  'x-jsf-layout': {
    type: 'columns',
    columns: 2,
    gap: '16px'
  },
  properties: {
    firstName: {
      type: 'string',
      'x-jsf-presentation': { inputType: 'text' }
    },
    lastName: {
      type: 'string', 
      'x-jsf-presentation': { inputType: 'text' }
    },
    email: {
      type: 'string',
      'x-jsf-presentation': { inputType: 'email' }
    }
  }
}

const form = createHeadlessForm(schema)
console.log(form.layout) // { type: 'columns', columns: 2, gap: '16px' }
// También disponible desde los fields para backwards compatibility:
console.log(form.fields[0]._rootLayout) // { type: 'columns', columns: 2, gap: '16px' }
```

## Layout Responsivo

```typescript
const schema = {
  type: 'object',
  'x-jsf-layout': {
    type: 'columns',
    columns: 1, // Por defecto 1 columna
    gap: '20px',
    responsive: {
      sm: 1, // 1 columna en móvil
      md: 2, // 2 columnas en tablet  
      lg: 3, // 3 columnas en desktop
      xl: 4  // 4 columnas en pantallas grandes
    }
  },
  properties: {
    // ... campos del formulario
  }
}
```

## Control de Columnas por Campo

### ColSpan Estático

```typescript
const schema = {
  type: 'object',
  'x-jsf-layout': {
    type: 'columns',
    columns: 3,
    gap: '16px'
  },
  properties: {
    title: {
      type: 'string',
      'x-jsf-layout': {
        colSpan: 3 // Este campo ocupará las 3 columnas
      },
      'x-jsf-presentation': { inputType: 'text' }
    },
    firstName: {
      type: 'string',
      'x-jsf-presentation': { inputType: 'text' }
    },
    lastName: {
      type: 'string', 
      'x-jsf-presentation': { inputType: 'text' }
    },
    description: {
      type: 'string',
      'x-jsf-layout': {
        colSpan: 2 // Este campo ocupará 2 columnas
      },
      'x-jsf-presentation': { inputType: 'textarea' }
    }
  }
}
```

### ColSpan Responsivo 🆕

```typescript
const schema = {
  type: 'object',
  'x-jsf-layout': {
    type: 'columns',
    columns: 4,
    gap: '16px',
    responsive: {
      sm: 1, // 1 columna en móvil
      md: 2, // 2 columnas en tablet
      lg: 4  // 4 columnas en desktop
    }
  },
  properties: {
    title: {
      type: 'string',
      'x-jsf-layout': {
        colSpan: {
          sm: 1, // Ocupa 1 columna en móvil (toda la fila)
          md: 2, // Ocupa 2 columnas en tablet (toda la fila)
          lg: 4  // Ocupa 4 columnas en desktop (toda la fila)
        }
      },
      'x-jsf-presentation': { inputType: 'text' }
    },
    description: {
      type: 'string',
      'x-jsf-layout': {
        colSpan: {
          sm: 1, // 1 columna en móvil
          md: 2, // 2 columnas en tablet  
          lg: 3  // 3 columnas en desktop
        }
      },
      'x-jsf-presentation': { inputType: 'textarea' }
    }
  }
}
```

## Posicionamiento Específico

```typescript
const schema = {
  type: 'object',
  'x-jsf-layout': {
    type: 'columns',
    columns: 4
  },
  properties: {
    field1: {
      type: 'string',
      'x-jsf-layout': {
        colStart: 1,
        colEnd: 3 // Ocupa de la columna 1 a la 3
      }
    },
    field2: {
      type: 'string',
      'x-jsf-layout': {
        colStart: 4 // Empieza en la columna 4
      }
    }
  }
}
```

## Utilidades para UI Libraries

### Generar Propiedades CSS

```typescript
import { 
  generateCSSGridProperties, 
  generateResponsiveCSS,
  generateResponsiveFieldCSS,
  getFieldLayoutInfo 
} from '@remoteoss/json-schema-form'

// Para el contenedor del formulario - Método directo (recomendado)
const form = createHeadlessForm(schema)
const layoutInfo = form.layout

// Alternativamente, puedes usar la función helper
const layoutInfoAlternative = getFormContainerLayout(form.fields)

if (layoutInfo) {
  const cssProperties = generateCSSGridProperties(layoutInfo)
  // cssProperties = {
  //   display: 'grid',
  //   'grid-template-columns': 'repeat(2, 1fr)',
  //   gap: '16px'
  // }
  
  const responsiveCSS = generateResponsiveCSS(layoutInfo)
  // Genera media queries automáticamente
}

// Para campos individuales
form.fields.forEach(field => {
  const fieldLayout = getFieldLayoutInfo(field)
  if (fieldLayout?.colSpan) {
    const fieldCSS = generateCSSGridProperties(fieldLayout)
    // fieldCSS = { 'grid-column': 'span 2' }
    
    // Si el campo tiene colSpan responsivo
    if (typeof fieldLayout.colSpan === 'object') {
      const responsiveFieldCSS = generateResponsiveFieldCSS(fieldLayout)
      // responsiveFieldCSS = '@media (min-width: 768px) { grid-column: span 2; }'
    }
  }
})
```

### Integración con React

```tsx
import React from 'react'
import { createHeadlessForm, generateCSSGridProperties } from '@remoteoss/json-schema-form'

function MyForm({ schema }) {
  const form = createHeadlessForm(schema)
  const rootField = form.fields[0]
  
  // Obtener estilos CSS del layout
  const containerStyle = rootField.layout 
    ? generateCSSGridProperties(rootField.layout)
    : {}

  return (
    <div style={containerStyle}>
      {form.fields.map(field => (
        <div 
          key={field.name}
          style={field.layout ? generateCSSGridProperties(field.layout) : {}}
        >
          {/* Renderizar el campo según su inputType */}
          <input type={field.inputType === 'email' ? 'email' : 'text'} />
        </div>
      ))}
    </div>
  )
}
```

## Validación

La librería incluye validación automática de configuraciones de layout:

```typescript
import { isValidLayoutConfig } from '@remoteoss/json-schema-form'

const validLayout = {
  type: 'columns',
  columns: 2,
  gap: '16px'
}

console.log(isValidLayoutConfig(validLayout)) // true

const invalidLayout = {
  type: 'flexbox', // tipo no soportado
  columns: -1 // valor inválido
}

console.log(isValidLayoutConfig(invalidLayout)) // false
```

## Breakpoints por Defecto

```typescript
const defaultBreakpoints = {
  sm: '640px',  // Móvil grande
  md: '768px',  // Tablet
  lg: '1024px', // Desktop
  xl: '1280px'  // Desktop grande
}
```

## Consideraciones

1. **Compatibilidad**: La funcionalidad es completamente opcional y no rompe formularios existentes
2. **Performance**: Solo se calculan las propiedades de layout cuando están definidas
3. **Flexibilidad**: Los breakpoints y estilos pueden ser personalizados según las necesidades de tu UI library
4. **Mantenimiento**: Usa el patrón `x-jsf-*` establecido, manteniendo compatibilidad con futuras versiones

## Futuras Extensiones

La estructura está preparada para soportar más tipos de layout en el futuro:

```typescript
// Posibles extensiones futuras
'x-jsf-layout': {
  type: 'flexbox', // Soporte para flexbox
  type: 'masonry', // Soporte para masonry layout
  type: 'custom'   // Layouts personalizados
}
```