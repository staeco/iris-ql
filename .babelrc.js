const core = require('@stae/babel-node')

module.exports = {
  ...core,
  env: {
    ...core.env,
    test: {
      plugins: [ 'istanbul' ]
    }
  }
}
