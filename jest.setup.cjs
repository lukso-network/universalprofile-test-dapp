module.exports = async () => {
  process.env.TZ = 'UTC'

  global.crypto = require('isomorphic-webcrypto')
  console.log(global.crypto)
}
