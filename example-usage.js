/**
 * Example: Complete Usage of @laus/json-schema-form
 *
 * This example demonstrates:
 * - All input types (text, textarea, email, number, money, date, select, radio, checkbox, file, fieldset, group-array, country, hidden, autocomplete)
 * - Custom validations with JSON Logic
 * - Computed values
 * - Conditional logic (if/then/else)
 * - Async options loaders
 * - Custom error messages
 * - Responsive layout
 * - File upload with validation
 */

import { createHeadlessForm } from '@laus/json-schema-form'
import exampleSchema from './example-schema.json'

// Mock data for async loaders
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'JP', name: 'Japan' },
  { code: 'AU', name: 'Australia' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'IN', name: 'India' },
  { code: 'CN', name: 'China' },
]

const SKILLS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Vue.js',
  'Angular',
  'Node.js',
  'Python',
  'Java',
  'C#',
  'Ruby',
  'Go',
  'Rust',
  'PHP',
  'Swift',
  'Kotlin',
  'SQL',
  'MongoDB',
  'PostgreSQL',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'GCP',
  'GraphQL',
  'REST API',
  'CI/CD',
  'Git',
  'Agile',
  'Scrum',
]

// Create the form with async options loaders
const form = createHeadlessForm({
  schema: exampleSchema,

  // Register async options loaders
  asyncOptionsLoaders: {
    // Country loader with search support
    loadCountries: async ({ search, signal }) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))

      // Check if request was cancelled
      if (signal?.aborted) {
        throw new Error('Request cancelled')
      }

      // Filter countries based on search
      const filtered = search
        ? COUNTRIES.filter(country =>
            country.name.toLowerCase().includes(search.toLowerCase()),
          )
        : COUNTRIES

      return {
        options: filtered.map(country => ({
          label: country.name,
          value: country.code,
        })),
      }
    },

    // Skills loader with search support
    loadSkills: async ({ search, signal }) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200))

      if (signal?.aborted) {
        throw new Error('Request cancelled')
      }

      // Filter skills based on search
      const filtered = search
        ? SKILLS.filter(skill =>
            skill.toLowerCase().includes(search.toLowerCase()),
          )
        : SKILLS

      return {
        options: filtered.map(skill => ({
          label: skill,
          value: skill.toLowerCase().replace(/\s+/g, '-'),
        })),
      }
    },
  },

  // Initial form values (optional)
  initialValues: {
    formType: 'user-registration',
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      age: '',
      dateOfBirth: '',
      country: '',
      bio: '',
      gender: '',
      maritalStatus: '',
    },
    accountSettings: {
      username: '',
      password: '',
      newsletter: true,
      notifications: [],
      profileVisibility: 'friends',
    },
    employment: {
      employmentStatus: '',
      jobTitle: '',
      companyName: '',
      expectedSalary: '',
      startDate: '',
      workExperience: [],
    },
    documents: {
      resume: '',
      coverLetter: '',
      portfolio: '',
    },
    preferences: {
      skills: [],
      remoteWork: false,
      relocate: false,
      workVisa: false,
    },
    termsAndConditions: false,
  },
})

// Access form fields
console.log('Form Fields:', form.fields)

// Example: Get all visible fields
const visibleFields = form.fields.filter(field => field.isVisible)
console.log('Visible Fields:', visibleFields.length)

// Example: Handle form value changes
function handleChange(fieldName, value) {
  // Update form values
  const updatedValues = {
    ...form.values,
    [fieldName]: value,
  }

  // Recreate form with new values (in real app, you'd use state management)
  const updatedForm = createHeadlessForm({
    schema: exampleSchema,
    asyncOptionsLoaders: form.asyncOptionsLoaders,
    initialValues: updatedValues,
  })

  console.log('Updated Form:', updatedForm)
  return updatedForm
}

// Example: Validate form
function validateForm(values) {
  const validationForm = createHeadlessForm({
    schema: exampleSchema,
    asyncOptionsLoaders: form.asyncOptionsLoaders,
    initialValues: values,
  })

  const errors = validationForm.validate()

  if (errors.length > 0) {
    console.error('Validation Errors:', errors)
    return { isValid: false, errors }
  }

  console.log('Form is valid!')
  return { isValid: true, errors: [] }
}

// Example: Submit form
async function handleSubmit(values) {
  // Validate first
  const { isValid, errors } = validateForm(values)

  if (!isValid) {
    console.error('Cannot submit - form has errors:', errors)
    return
  }

  // Submit to API
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    })

    if (!response.ok) {
      throw new Error('Submission failed')
    }

    const result = await response.json()
    console.log('Submission successful:', result)

    return result
  }
  catch (error) {
    console.error('Submission error:', error)
    throw error
  }
}

// Example: Render field based on type (React example)
function renderField(field) {
  switch (field.inputType) {
    case 'text':
    case 'email':
      return `
        <div>
          <label htmlFor="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
          <input
            type="${field.inputType}"
            id="${field.name}"
            name="${field.name}"
            required="${field.required}"
            minLength="${field.minLength}"
            maxLength="${field.maxLength}"
            pattern="${field.pattern}"
          />
          ${field.description ? `<small>${field.description}</small>` : ''}
        </div>
      `

    case 'textarea':
      return `
        <div>
          <label htmlFor="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
          <textarea
            id="${field.name}"
            name="${field.name}"
            required="${field.required}"
            maxLength="${field.maxLength}"
          ></textarea>
          ${field.description ? `<small>${field.description}</small>` : ''}
        </div>
      `

    case 'number':
    case 'money':
      return `
        <div>
          <label htmlFor="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
          <input
            type="number"
            id="${field.name}"
            name="${field.name}"
            required="${field.required}"
            min="${field.minimum}"
            max="${field.maximum}"
          />
          ${field.description ? `<small>${field.description}</small>` : ''}
        </div>
      `

    case 'date':
      return `
        <div>
          <label htmlFor="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
          <input
            type="date"
            id="${field.name}"
            name="${field.name}"
            required="${field.required}"
            min="${field.minDate}"
            max="${field.maxDate}"
          />
        </div>
      `

    case 'select':
      return `
        <div>
          <label htmlFor="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
          <select id="${field.name}" name="${field.name}" required="${field.required}">
            <option value="">Select...</option>
            ${field.options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
          </select>
        </div>
      `

    case 'radio':
      return `
        <fieldset>
          <legend>${field.label}${field.required ? ' *' : ''}</legend>
          ${field.options.map(opt => `
            <label>
              <input type="radio" name="${field.name}" value="${opt.value}" required="${field.required}" />
              ${opt.label}
            </label>
          `).join('')}
        </fieldset>
      `

    case 'checkbox':
      if (field.options) {
        // Multiple checkboxes
        return `
          <fieldset>
            <legend>${field.label}</legend>
            ${field.options.map(opt => `
              <label>
                <input type="checkbox" name="${field.name}" value="${opt.value}" />
                ${opt.label}
              </label>
            `).join('')}
          </fieldset>
        `
      }
      else {
        // Single checkbox
        return `
          <label>
            <input type="checkbox" name="${field.name}" required="${field.required}" />
            ${field.label}${field.required ? ' *' : ''}
            ${field.description ? `<small>${field.description}</small>` : ''}
          </label>
        `
      }

    case 'file':
      return `
        <div>
          <label htmlFor="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
          <input
            type="file"
            id="${field.name}"
            name="${field.name}"
            required="${field.required}"
            accept="${field.accept}"
          />
          ${field.description ? `<small>${field.description}</small>` : ''}
        </div>
      `

    case 'autocomplete':
      return `
        <div>
          <label htmlFor="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
          <input
            type="text"
            id="${field.name}"
            name="${field.name}"
            required="${field.required}"
            list="${field.name}-datalist"
          />
          <datalist id="${field.name}-datalist">
            ${field.options?.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('') || ''}
          </datalist>
          ${field.description ? `<small>${field.description}</small>` : ''}
        </div>
      `

    case 'fieldset':
      return `
        <fieldset>
          <legend>${field.label}</legend>
          ${field.description ? `<p>${field.description}</p>` : ''}
          ${field.fields?.map(subField => renderField(subField)).join('') || ''}
        </fieldset>
      `

    case 'group-array':
      return `
        <fieldset>
          <legend>${field.label}</legend>
          <div class="group-array-container">
            <!-- Render array items here -->
            ${field.fields?.map((item, index) => `
              <div class="group-array-item" data-index="${index}">
                ${renderField(item)}
              </div>
            `).join('') || ''}
          </div>
          <button type="button" onclick="addArrayItem('${field.name}')">Add ${field.label}</button>
        </fieldset>
      `

    case 'hidden':
      return `<input type="hidden" name="${field.name}" />`

    default:
      return `<div>Unknown field type: ${field.inputType}</div>`
  }
}

// Example: Print all fields with details
console.log('\n=== FORM FIELDS BREAKDOWN ===\n')
form.fields.forEach((field) => {
  console.log(`Field: ${field.name}`)
  console.log(`  Type: ${field.inputType}`)
  console.log(`  JSON Type: ${field.jsonType}`)
  console.log(`  Label: ${field.label}`)
  console.log(`  Required: ${field.required}`)
  console.log(`  Visible: ${field.isVisible}`)
  if (field.description) { console.log(`  Description: ${field.description}`) }
  if (field.options) { console.log(`  Options: ${field.options.length} options`) }
  if (field.fields) { console.log(`  Nested Fields: ${field.fields.length} fields`) }
  console.log('')
})

// Export for use in other modules
export {
  form,
  handleChange,
  handleSubmit,
  renderField,
  validateForm,
}
