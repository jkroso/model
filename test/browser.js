var mocha = require('mocha')
mocha.setup('bdd')

// load tests
require('./model')
require('./statics')

mocha.run(function () {
  console.log('Done!')
})