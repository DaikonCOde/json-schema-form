<p align="center">
<img src=".github/media/jsf_logo_dark.png"  width="600" alt="json-schema-form">
</p>

<p align="center">
  <code>json-schema-form</code> is a headless UI form library powered by <a href="https://json-schema.org/">JSON Schemas</a>. 
<br/>
  It transforms JSON schemas into Javascript `fields` to be more easily consumed by your UI libraries.
</p>

---

### Why JSON Schemas for forms?

JSON Schemas are the SSoT (Single Source of Truth) that allows you to share form's data _structure_ and _validations_ between the server (backend) and the client (frontend), regardless of the language used.

You can use it beyond UI Forms, like lists, tables, and any other UI that needs structured JSON data.

## Installation

Available on [NPM](https://www.npmjs.com/package/@laus/json-schema-form).

```bash
npm install @laus/json-schema-form
# or

yarn add @laus/json-schema-form
```

## Getting Started

Check the 📚 **[JSF website](https://json-schema-form.vercel.app/)** for documentation.

## Documentation

### JSON Schema Reference

For a complete reference of all supported JSON Schema keywords, custom extensions, and field types, see:

📖 **[JSON Schema Reference Guide](SCHEMA.md)**

This comprehensive guide includes:
- Standard JSON Schema keywords (type, properties, validation, etc.)
- Custom `x-jsf-*` extensions (presentation, layout, logic, etc.)
- All supported input types and formats
- JSON Logic operations for custom validations
- Async options configuration
- Complete field structure reference
- Validation error types

### Playground

Check the 🕹️ **[JSF Playground](https://json-schema-form.vercel.app/?path=/docs/playground--docs)** for demos.

## Contributing

Read [CONTRIBUTING](CONTRIBUTING.md) to get started.

## Migrating

If you're using `v0` and wish to migrate to `v1`, read [MIGRATING](MIGRATING.md) to get started.

_Backed by [Remote.com](https://remote.com/)_
