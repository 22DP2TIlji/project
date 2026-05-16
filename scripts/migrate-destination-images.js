const crypto = require('crypto')
const fs = require('fs/promises')
const path = require('path')
const mysql = require('mysql2/promise')
require('dotenv').config()

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'destinations')
const PUBLIC_UPLOAD_PATH = '/uploads/destinations'

const MIME_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

function parseDataUrl(value) {
  if (typeof value !== 'string') return null

  const match = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/)
  if (!match) return null

  const mimeType = match[1].toLowerCase()
  const extension = MIME_EXTENSIONS[mimeType]
  if (!extension) return null

  return {
    extension,
    buffer: Buffer.from(match[2], 'base64'),
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL nav norādīts .env failā')
  }

  const connection = await mysql.createConnection(process.env.DATABASE_URL)
  await fs.mkdir(UPLOAD_DIR, { recursive: true })

  const [rows] = await connection.execute(
    'SELECT id, image_url FROM destinations WHERE image_url LIKE ?',
    ['data:image/%'],
  )

  let migratedCount = 0
  let skippedCount = 0

  for (const row of rows) {
    const parsed = parseDataUrl(row.image_url)

    if (!parsed) {
      skippedCount += 1
      continue
    }

    const fileName = `${Date.now()}-${row.id}-${crypto.randomUUID()}.${parsed.extension}`
    const filePath = path.join(UPLOAD_DIR, fileName)
    const publicPath = `${PUBLIC_UPLOAD_PATH}/${fileName}`

    await fs.writeFile(filePath, parsed.buffer)
    await connection.execute('UPDATE destinations SET image_url = ? WHERE id = ?', [publicPath, row.id])
    migratedCount += 1
  }

  await connection.end()

  console.log(`Migrated: ${migratedCount}`)
  console.log(`Skipped: ${skippedCount}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})