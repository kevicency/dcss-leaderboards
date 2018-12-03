var functions = require('../lib')

module.exports = async function() {
  const h = Math.round(new Date().getHours() - 4)
  const m = Math.round(new Date().getMinutes() / 15)

  await functions.sync(h * 4 + m)
}
