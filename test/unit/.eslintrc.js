'use strict';

// Clone the main config
const config = module.exports = JSON.parse(JSON.stringify(require('../../.eslintrc')));

// Test overrides
config.rules.camelcase = 'warn';
config.rules['max-len'] = 'off';
config.rules['no-underscore-dangle'] = 'off';
