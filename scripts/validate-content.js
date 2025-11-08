const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
addFormats(ajv);

const commonSchema = {
  type: 'object',
  required: ['nav', 'cta', 'footer', 'apps', 'form'],
  properties: {
    nav: { type: 'object' },
    cta: { type: 'object' },
    faq: { type: 'object' },
    footer: { type: 'object' },
    apps: { type: 'object' },
    form: {
      type: 'object',
      required: ['name', 'email', 'message', 'send', 'success', 'error'],
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        message: { type: 'string' },
        send: { type: 'string' },
        success: { type: 'string' },
        error: { type: 'string' }
      }
    }
  },
  additionalProperties: true
};

const pageSchema = {
  type: 'object',
  required: ['category', 'title'],
  properties: {
    category: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    hero: { type: 'object' },
    sections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          heading: { type: 'string' },
          body: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                body: { type: 'string' },
                link: { type: 'string' },
                ctaLabel: { type: 'string' }
              },
              additionalProperties: true
            }
          }
        },
        additionalProperties: true
      }
    },
    appDetails: { type: 'object' }
  },
  additionalProperties: true
};

function validateFile(schema, filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    const messages = validate.errors.map(err => `${err.instancePath || '/'} ${err.message}`).join('; ');
    throw new Error(`Schema error in ${filePath}: ${messages}`);
  }
}

const root = path.resolve(__dirname, '..', 'content');
const languages = ['ar', 'en', 'fr'];

languages.forEach(lang => {
  validateFile(commonSchema, path.join(root, lang, 'common.json'));
  fs.readdirSync(path.join(root, lang))
    .filter(name => name.endsWith('.json') && name !== 'common.json' && name !== 'faq.json')
    .forEach(file => {
      validateFile(pageSchema, path.join(root, lang, file));
    });
});

console.log('Content JSON validated successfully.');
