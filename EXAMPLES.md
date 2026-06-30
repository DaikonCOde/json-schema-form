# Complete Examples

This directory contains comprehensive examples demonstrating all features of `@laus/json-schema-form`.

## Files

- **`example-schema.json`** - Complete JSON Schema showcasing all input types and features
- **`example-usage.js`** - JavaScript example showing how to use the schema with the library

## What's Demonstrated

### 📝 All Input Types

The example schema includes **every input type** supported by the library:

1. **`text`** - First name, last name, username, job title, company name, portfolio URL
2. **`textarea`** - Biography field with character limit
3. **`email`** - Email address with format validation
4. **`number`** - Age with min/max validation
5. **`money`** - Expected salary with custom validation
6. **`date`** - Date of birth, start date with min/max date constraints
7. **`select`** - Marital status, employment status
8. **`radio`** - Gender, profile visibility
9. **`checkbox`** - Single (newsletter, remote work) and multiple (notifications)
10. **`file`** - Resume and cover letter with size/type restrictions
11. **`fieldset`** - Personal info, account settings, employment, documents, preferences
12. **`group-array`** - Work experience (repeating fields)
13. **`country`** - Country selector (via autocomplete)
14. **`hidden`** - Form type and submitted by
15. **`autocomplete`** - Country and skills with async loading

### ⚡ Advanced Features

#### 1. Custom Validations with JSON Logic
```json
{
  "validations": {
    "passwordStrength": {
      "rule": { ">=": [{ "var": "password.length" }, 8] },
      "errorMessage": "Password must be at least 8 characters"
    },
    "ageVerification": {
      "rule": { ">=": [{ "var": "personalInfo.age" }, 18] },
      "errorMessage": "You must be at least 18 years old"
    }
  }
}
```

#### 2. Computed Values
```json
{
  "computedValues": {
    "fullName": {
      "rule": {
        "concat": [
          { "var": "personalInfo.firstName" },
          " ",
          { "var": "personalInfo.lastName" }
        ]
      }
    },
    "isAdult": {
      "rule": { ">=": [{ "var": "personalInfo.age" }, 18] }
    }
  }
}
```

#### 3. Conditional Logic (if/then/else)
```json
{
  "if": {
    "properties": {
      "employmentStatus": { "enum": ["employed", "self-employed"] }
    }
  },
  "then": {
    "required": ["jobTitle", "companyName", "expectedSalary"]
  }
}
```

#### 4. Computed Attributes
```json
{
  "x-jsf-logic-computedAttrs": {
    "default": "needsWorkVisa",
    "x-jsf-presentation": {
      "minDate": "minStartDate"
    }
  }
}
```

#### 5. Responsive Layout (CSS Grid)
```json
{
  "x-jsf-layout": {
    "type": "columns",
    "columns": 2,
    "gap": "1.5rem",
    "responsive": {
      "sm": 1,
      "md": 2,
      "lg": 2,
      "xl": 3
    }
  }
}
```

#### 6. Async Options Loading
```json
{
  "asyncOptions": {
    "id": "loadCountries",
    "searchable": true,
    "debounceMs": 300
  }
}
```

#### 7. Custom Error Messages
```json
{
  "x-jsf-errorMessage": {
    "required": "First name is required",
    "minLength": "First name must be at least 2 characters",
    "pattern": "First name can only contain letters"
  }
}
```

#### 8. File Upload Validation
```json
{
  "x-jsf-presentation": {
    "accept": ".pdf,.doc,.docx",
    "maxFileSize": 5120,
    "description": "Upload your resume (PDF or DOC, max 5MB)"
  }
}
```

#### 9. Field Ordering
```json
{
  "x-jsf-order": [
    "firstName",
    "lastName",
    "email",
    "age",
    "dateOfBirth"
  ]
}
```

## How to Use

### 1. Install the library
```bash
npm install @laus/json-schema-form
```

### 2. Import and create form
```javascript
import { createHeadlessForm } from '@laus/json-schema-form'
import schema from './example-schema.json'

const form = createHeadlessForm({
  schema,
  asyncOptionsLoaders: {
    loadCountries: async ({ search }) => {
      const response = await fetch(`/api/countries?search=${search}`)
      const data = await response.json()
      return { options: data }
    }
  }
})
```

### 3. Access form fields
```javascript
console.log(form.fields) // Array of all form fields
```

### 4. Validate form
```javascript
const errors = form.validate()
if (errors.length > 0) {
  console.error('Validation errors:', errors)
}
```

### 5. Render fields in your UI framework

**React Example:**
```jsx
import { createHeadlessForm } from '@laus/json-schema-form'
import schema from './example-schema.json'

function MyForm() {
  const [values, setValues] = useState({})

  const form = createHeadlessForm({
    schema,
    initialValues: values,
    asyncOptionsLoaders: {
      // ... your loaders
    }
  })

  return (
    <form>
      {form.fields.map(field => (
        <FormField
          key={field.name}
          field={field}
          value={values[field.name]}
          onChange={(value) => setValues({ ...values, [field.name]: value })}
        />
      ))}
    </form>
  )
}
```

**Vue Example:**
```vue
<template>
  <form>
    <FormField
      v-for="field in form.fields"
      :key="field.name"
      :field="field"
      :value="values[field.name]"
      @change="handleChange(field.name, $event)"
    />
  </form>
</template>

<script setup>
import { ref, computed } from 'vue'
import { createHeadlessForm } from '@laus/json-schema-form'
import schema from './example-schema.json'

const values = ref({})

const form = computed(() => createHeadlessForm({
  schema,
  initialValues: values.value,
  asyncOptionsLoaders: {
    // ... your loaders
  }
}))

function handleChange(name, value) {
  values.value = { ...values.value, [name]: value }
}
</script>
```

## Running the Example

### Option 1: Node.js
```bash
node example-usage.js
```

### Option 2: Browser
```html
<!DOCTYPE html>
<html>
<head>
  <title>JSON Schema Form Example</title>
</head>
<body>
  <div id="app"></div>
  <script type="module">
    import { form } from './example-usage.js'
    console.log('Form:', form)
    console.log('Fields:', form.fields)
  </script>
</body>
</html>
```

### Option 3: Testing in Real Project

1. Copy `example-schema.json` to your project
2. Import and use it with your preferred UI framework
3. Implement the async loaders for your API endpoints
4. Customize the styling to match your design system

## Form Structure Breakdown

The example form is organized into **6 main sections**:

### 1. Personal Information (fieldset)
- First Name (text)
- Last Name (text)
- Email (email)
- Age (number) with custom validation
- Date of Birth (date)
- Country (autocomplete with async)
- Biography (textarea)
- Gender (radio)
- Marital Status (select)

### 2. Account Settings (fieldset)
- Username (text) with pattern validation
- Password (text) with custom validation
- Profile Visibility (radio)
- Newsletter (checkbox)
- Notifications (checkbox multiple)

### 3. Employment Information (fieldset)
- Employment Status (select)
- Job Title (text)
- Company Name (text)
- Expected Salary (money) with range validation
- Start Date (date) with computed min date
- Work Experience (group-array) - repeating fields

### 4. Documents (fieldset)
- Resume (file) - required, PDF/DOC only, max 5MB
- Cover Letter (file) - optional, max 3MB
- Portfolio URL (text)

### 5. Preferences (fieldset)
- Skills (autocomplete with async)
- Remote Work (checkbox)
- Willing to Relocate (checkbox)
- Work Visa (checkbox with computed default)

### 6. Terms and Conditions
- Agreement (checkbox) - required with const validation

## Validation Rules Summary

The example includes these validation types:

- ✅ **Required fields** - Multiple required fields across sections
- ✅ **String length** - minLength, maxLength on text fields
- ✅ **Pattern matching** - Regex validation on username, names
- ✅ **Format validation** - Email, date, URI formats
- ✅ **Number ranges** - Min/max on age and salary
- ✅ **Custom JSON Logic** - Password strength, age verification, salary range
- ✅ **Conditional required** - Fields required based on other field values
- ✅ **File validation** - Size and type restrictions
- ✅ **Array validation** - Min/max items on work experience
- ✅ **Const validation** - Terms and conditions must be true

## Computed Values in Action

The schema computes these values automatically:

1. **`fullName`** - Concatenates first + last name
2. **`isAdult`** - Boolean based on age >= 18
3. **`ageCategory`** - "Minor", "Adult", or "Senior"
4. **`needsWorkVisa`** - True if country != "US"
5. **`minStartDate`** - Dynamic minimum date for employment start

These computed values are:
- Used in other field validations
- Set as default values via `x-jsf-logic-computedAttrs`
- Available for display in error messages
- Hidden field values (e.g., submittedBy)

## Tips for Customization

### Change Layout
Modify `x-jsf-layout` to adjust columns and responsiveness:
```json
{
  "x-jsf-layout": {
    "columns": 3,
    "responsive": {
      "sm": 1,
      "md": 2,
      "lg": 3
    }
  }
}
```

### Add More Validations
Add custom validations in `x-jsf-logic.validations`:
```json
{
  "x-jsf-logic": {
    "validations": {
      "customRule": {
        "rule": { "your": "json-logic" },
        "errorMessage": "Your error message"
      }
    }
  }
}
```

### Modify Async Loaders
Update the loader functions in `example-usage.js` to call your real API:
```javascript
asyncOptionsLoaders: {
  loadCountries: async ({ search }) => {
    const response = await fetch(`https://your-api.com/countries?q=${search}`)
    const data = await response.json()
    return {
      options: data.map(item => ({
        label: item.name,
        value: item.id
      }))
    }
  }
}
```

### Change Input Types
Override auto-inferred types with `x-jsf-presentation.inputType`:
```json
{
  "type": "string",
  "x-jsf-presentation": {
    "inputType": "textarea"
  }
}
```

## Next Steps

1. **Study the schema** - Read through `example-schema.json` to understand the structure
2. **Run the example** - Execute `example-usage.js` to see the output
3. **Customize** - Modify the schema to fit your needs
4. **Integrate** - Use with your UI framework (React, Vue, Angular, etc.)
5. **Test** - Validate the form behavior with different input values

## Additional Resources

- 📖 [JSON Schema Reference](SCHEMA.md) - Complete field reference
- 🌐 [Official Docs](https://json-schema-form.vercel.app/) - Full documentation
- 🎮 [Playground](https://json-schema-form.vercel.app/?path=/docs/playground--docs) - Interactive demos
- 💻 [GitHub](https://github.com/DaikonCOde/json-schema-form) - Source code

## Questions?

If you have questions or need help:
1. Check the [JSON Schema Reference](SCHEMA.md)
2. Review the [official documentation](https://json-schema-form.vercel.app/)
3. Open an issue on [GitHub](https://github.com/DaikonCOde/json-schema-form/issues)
