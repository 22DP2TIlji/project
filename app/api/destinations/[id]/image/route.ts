import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type RouteParams = { params: { id: string } }

const DATA_URL_PATTERN = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/
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