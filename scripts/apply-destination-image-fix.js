const fs = require('fs')
const path = require('path')

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, content)
}

function updatePackageJson() {
  const packagePath = 'package.json'
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

  pkg.scripts = {
    ...pkg.scripts,
    'images:migrate': 'node scripts/migrate-destination-images.js',
    'images:migrate:docker': 'node scripts/migrate-destination-images-docker.js',
  }

  fs.writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`)
}

function updateGitignore() {
  const gitignorePath = '.gitignore'
  const marker = [
    '# local uploaded destination images',
    '/public/uploads/destinations/*',
    '!/public/uploads/destinations/.gitkeep',
  ].join('\n')
  const current = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : ''

  if (current.includes('/public/uploads/destinations/*')) {
    return
  }

  fs.writeFileSync(gitignorePath, `${current.trimEnd()}\n\n${marker}\n`)
}


function updateDestinationImageProxy() {
  writeFile('app/api/destinations/[id]/image/route.ts', `import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type RouteParams = { params: { id: string } }

const DATA_URL_PATTERN = /^data:(image\\/[a-zA-Z0-9.+-]+);base64,(.+)$/
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'])

export async function GET(_: Request, { params }: RouteParams) {
  const destinationId = Number.parseInt(params.id, 10)

  if (!Number.isFinite(destinationId)) {
    return NextResponse.json({ success: false, message: 'Invalid id' }, { status: 400 })
  }

  const destination = await prisma.destination.findUnique({
    where: { id: destinationId },
    select: { imageUrl: true },
  })

  const parsed = parseImageDataUrl(destination?.imageUrl ?? null)

  if (!parsed) {
    return NextResponse.json({ success: false, message: 'Image not found' }, { status: 404 })
  }

  return new NextResponse(parsed.body, {
  headers: {
    'Content-Type': parsed.mimeType,
    'Cache-Control': 'public, max-age=31536000, immutable',
  },
})
}

function parseImageDataUrl(value: string | null): { mimeType: string; body: ArrayBuffer } | null {
  if (!value) return null

  const match = value.match(DATA_URL_PATTERN)
  if (!match) return null

  const mimeType = match[1].toLowerCase()
  if (!ALLOWED_MIME_TYPES.has(mimeType)) return null

  return {
    mimeType,
    body: Uint8Array.from(Buffer.from(match[2], 'base64')).buffer as ArrayBuffer,
  }
}
`)

  const destinationsRoutePath = 'app/api/destinations/route.ts'
  if (fs.existsSync(destinationsRoutePath)) {
    let source = fs.readFileSync(destinationsRoutePath, 'utf8')
    source = source.replaceAll('image_url: normalizeImageUrl(d.imageRaw ?? null),', 'image_url: normalizeImageUrl(d.imageRaw ?? null, d.id),')
    source = source.replace('function normalizeImageUrl(value: string | null): string | null {', 'function normalizeImageUrl(value: string | null, destinationId: number): string | null {')

    if (!source.includes("raw.startsWith('data:image/')")) {
      source = source.replace("  if (raw.startsWith('//')) return `https:${raw}`", "  if (raw.startsWith('data:image/')) return `/api/destinations/${destinationId}/image`\n  if (raw.startsWith('//')) return `https:${raw}`")
    }

    fs.writeFileSync(destinationsRoutePath, source)
  }

  const destinationRoutePath = 'app/api/destinations/[id]/route.ts'
  if (fs.existsSync(destinationRoutePath)) {
    let source = fs.readFileSync(destinationRoutePath, 'utf8')
    source = source.replace('image_url: normalizeImageUrl(destination.imageUrl),', 'image_url: normalizeImageUrl(destination.imageUrl, destination.id),')
    source = source.replace('function normalizeImageUrl(value: string | null): string | null {', 'function normalizeImageUrl(value: string | null, destinationId: number): string | null {')

    if (!source.includes('raw.startsWith("data:image/")')) {
      source = source.replace('  if (raw.startsWith("//")) return `https:${raw}`', '  if (raw.startsWith("data:image/")) return `/api/destinations/${destinationId}/image`\n  if (raw.startsWith("//")) return `https:${raw}`')
    }

    fs.writeFileSync(destinationRoutePath, source)
  }

  const destinationsPagePath = 'app/destinations/page.tsx'
  if (fs.existsSync(destinationsPagePath)) {
    let source = fs.readFileSync(destinationsPagePath, 'utf8')

    if (!source.includes('decoding="async"')) {
      source = source.replace(
        '                        alt={destination.name}\n                        className="w-full h-full object-cover"',
        '                        alt={destination.name}\n                        loading="lazy"\n                        decoding="async"\n                        className="w-full h-full object-cover"',
      )
    }

    fs.writeFileSync(destinationsPagePath, source)
  }
}

function updateAdminDashboard() {
  const adminPath = 'components/admin-dashboard.tsx'
  let source = fs.readFileSync(adminPath, 'utf8')
  const requirementsLine = 'const PASSWORD_REQUIREMENTS = /^(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$/\n'
  const resizeCode = `
const MAX_IMAGE_WIDTH = 1200
const MAX_IMAGE_HEIGHT = 900
const IMAGE_QUALITY = 0.78
const OUTPUT_IMAGE_TYPE = 'image/jpeg'

async function resizeImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Lūdzu izvēlieties attēla failu')
  }

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_IMAGE_WIDTH / bitmap.width, MAX_IMAGE_HEIGHT / bitmap.height)
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')

  canvas.width = width
  canvas.height = height
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result)
        } else {
          reject(new Error('Neizdevās saspiest attēlu'))
        }
      },
      OUTPUT_IMAGE_TYPE,
      IMAGE_QUALITY,
    )
  })

  return new File([blob], file.name.replace(/\\.[^.]+$/, '.jpg'), { type: OUTPUT_IMAGE_TYPE })
}
`

  if (!source.includes('async function resizeImage(file: File): Promise<File>')) {
    if (!source.includes(requirementsLine)) {
      throw new Error(`Cannot find insertion point in ${adminPath}`)
    }

    source = source.replace(requirementsLine, `${requirementsLine}${resizeCode}`)
  }

  const newUploadImage = `  const uploadImage = async (file: File): Promise<string> => {
    const compressedFile = await resizeImage(file)
    const formData = new FormData()
    formData.append('image', compressedFile)

    const res = await fetch('/api/admin/destination-images', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()

    if (!res.ok || !data.success || typeof data.imageUrl !== 'string') {
      throw new Error(data.message || 'Neizdevās augšupielādēt attēlu')
    }

    return data.imageUrl
  }
`

  if (source.includes("fetch('/api/admin/destination-images'")) {
    fs.writeFileSync(adminPath, source)
    return
  }

  const uploadStart = source.indexOf('  const uploadImage = async (file: File): Promise<string> => {')
  if (uploadStart === -1) {
    throw new Error(`Cannot find uploadImage in ${adminPath}`)
  }

  const submitStart = source.indexOf('\n  const handleEditSubmit = async', uploadStart)
  if (submitStart === -1) {
    throw new Error(`Cannot find handleEditSubmit after uploadImage in ${adminPath}`)
  }

  source = `${source.slice(0, uploadStart)}${newUploadImage}${source.slice(submitStart)}`
  fs.writeFileSync(adminPath, source)
}

writeFile('app/api/admin/destination-images/route.ts', `import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'destinations')
const PUBLIC_UPLOAD_PATH = '/uploads/destinations'
const MAX_FILE_SIZE = 8 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('image')

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: 'Attēla fails nav atrasts' },
        { status: 400 },
      )
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Atļauti tikai JPG, PNG vai WebP attēli' },
        { status: 400 },
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: 'Attēls ir par lielu. Maksimums: 8 MB' },
        { status: 400 },
      )
    }

    await mkdir(UPLOAD_DIR, { recursive: true })

    const extension = EXTENSIONS[file.type]
    const fileName = \`${'${Date.now()}'}-${'${randomUUID()}'}\.${'${extension}'}\`
    const filePath = path.join(UPLOAD_DIR, fileName)
    const buffer = Buffer.from(await file.arrayBuffer())

    await writeFile(filePath, buffer)

    return NextResponse.json({
      success: true,
      imageUrl: \`${'${PUBLIC_UPLOAD_PATH}'}/${'${fileName}'}\`,
    })
  } catch (error) {
    console.error('Kļūda POST /api/admin/destination-images:', error)

    return NextResponse.json(
      { success: false, message: 'Neizdevās augšupielādēt attēlu' },
      { status: 500 },
    )
  }
}
`)

writeFile('scripts/migrate-destination-images.js', `const crypto = require('crypto')
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

  const match = value.match(/^data:(image\\/[a-zA-Z0-9.+-]+);base64,(.+)$/)
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

    const fileName = \`${'${Date.now()}'}-${'${row.id}'}-${'${crypto.randomUUID()}'}\.${'${parsed.extension}'}\`
    const filePath = path.join(UPLOAD_DIR, fileName)
    const publicPath = \`${'${PUBLIC_UPLOAD_PATH}'}/${'${fileName}'}\`

    await fs.writeFile(filePath, parsed.buffer)
    await connection.execute('UPDATE destinations SET image_url = ? WHERE id = ?', [publicPath, row.id])
    migratedCount += 1
  }

  await connection.end()

  console.log(\`Migrated: ${'${migratedCount}'}\`)
  console.log(\`Skipped: ${'${skippedCount}'}\`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
`)

writeFile('scripts/migrate-destination-images-docker.js', `const net = require('net')
const { spawn } = require('child_process')

const DB_HOST = process.env.DESTINATION_IMAGE_DB_HOST || '127.0.0.1'
const DB_PORT = Number(process.env.DESTINATION_IMAGE_DB_PORT || 3306)
const WAIT_TIMEOUT_MS = 60_000

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: process.platform === 'win32' })

    child.on('error', (error) => {
      if (error.code === 'ENOENT') {
        reject(new Error(\`${'${command}'} is not installed or is not available in PATH\`))
        return
      }

      reject(error)
    })
    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(\`${'${command}'} ${'${args.join(\' \')}'} failed with exit code ${'${code}'}\`))
      }
    })
  })
}

function canConnect() {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: DB_HOST, port: DB_PORT })

    socket.once('connect', () => {
      socket.destroy()
      resolve(true)
    })

    socket.once('error', () => {
      socket.destroy()
      resolve(false)
    })
  })
}

async function waitForDatabase() {
  const startedAt = Date.now()

  while (Date.now() - startedAt < WAIT_TIMEOUT_MS) {
    if (await canConnect()) {
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  throw new Error(\`Database is not reachable at ${'${DB_HOST}'}:${'${DB_PORT}'}\`)
}

async function main() {
  await run('docker', ['compose', 'up', '-d', 'db'])
  await waitForDatabase()
  await run('node', ['scripts/migrate-destination-images.js'])
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
`)

writeFile('public/uploads/destinations/.gitkeep', '')
updatePackageJson()
updateGitignore()
updateAdminDashboard()
updateDestinationImageProxy()

console.log('Destination image storage fix has been applied.')
console.log('Next run: npm install && npm run images:migrate:docker')