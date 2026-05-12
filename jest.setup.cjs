module.exports = async () => {
  process.env.TZ = 'UTC'

  global.crypto = require('node:crypto').webcrypto
}
