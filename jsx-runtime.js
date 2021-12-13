'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/vue-jsx-runtime.prod.cjs')
} else {
  module.exports = require('./dist/vue-jsx-runtime.cjs')
}
