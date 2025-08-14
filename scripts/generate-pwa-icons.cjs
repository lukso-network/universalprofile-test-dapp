const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

async function generateIcons() {
  const inputFile = path.join(__dirname, '../public/lukso.png')
  const publicDir = path.join(__dirname, '../public')

  const sizes = [
    { size: 192, name: 'pwa-192x192.png' },
    { size: 512, name: 'pwa-512x512.png' },
  ]

  for (const { size, name } of sizes) {
    await sharp(inputFile)
      .resize(size, size)
      .toFile(path.join(publicDir, name))
    console.log(`Generated ${name}`)
  }

  console.log('PWA icons generated successfully!')
}

generateIcons().catch(console.error)