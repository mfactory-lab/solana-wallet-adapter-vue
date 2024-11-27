import antfu from '@antfu/eslint-config'

export default antfu(
  {
    stylistic: true,
    formatters: true,
    prettier: true,
    unicorn: {
      allRecommended: true,
    },
    regexp: {
      overrides: {
        'regexp/no-unused-capturing-group': 'off',
      },
    },
  },
  {
    rules: {
      // Vue specific rules
      'vue/component-name-in-template-casing': ['error', 'kebab-case'],

      'unicorn/prevent-abbreviations': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/import-style': [
        'error',
        {
          styles: {
            'path': {
              named: true,
            },
            'node:path': {
              named: true,
            },
          },
        },
      ],
    },
  },
  {
    files: [
      'example/*.vue',
    ],
    rules: {
      'no-alert': 'off',
    },
  },
)
