const { eslint } = require('@stae/linters')

module.exports = {
  ...eslint,
  overrides: [
    ...eslint.overrides || [],

    {
      files: [
        // generic cut-outs
        '**/test/**'
      ],
      rules: {
        'no-magic-numbers': 0
      }
    }
  ]
}
