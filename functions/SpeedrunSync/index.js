var functions = require('../lib')

module.exports = async function() {
  const iteration = Math.round(new Date().getMinutes() / 15)

  await functions.sync(iteration)
}
