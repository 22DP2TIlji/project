import { randomUUID } from 'crypto'
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
    const fileName = `${Date.now()}-${randomUUID()}.${extension}`
    const filePath = path.join(UPLOAD_DIR, fileName)
    const buffer = Buffer.from(await file.arrayBuffer())

    await writeFile(filePath, buffer)

    return NextResponse.json({
      success: true,
      imageUrl: `${PUBLIC_UPLOAD_PATH}/${fileName}`,
    })
  } catch (error) {
    console.error('Kļūda POST /api/admin/destination-images:', error)

    return NextResponse.json(
      { success: false, message: 'Neizdevās augšupielādēt attēlu' },
      { status: 500 },
    )
  }
}