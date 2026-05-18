import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { normalizeDestinationImageUrl } from '../../destination-images'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

type RouteParams = { params: { id: string } }

const DATA_URL_PATTERN = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/
const IMAGE_EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

async function saveDestinationImageFile(imageUrl: string | null, destinationId: number) {
  if (!imageUrl) return imageUrl

  const match = imageUrl.match(DATA_URL_PATTERN)
  if (!match) return imageUrl

  const mimeType = match[1].toLowerCase()
  const extension = IMAGE_EXTENSION_BY_MIME[mimeType]

  if (!extension) {
    throw new Error('Unsupported image type')
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'destinations')
  await mkdir(uploadDir, { recursive: true })

  const fileName = `destination-${destinationId}-${Date.now()}.${extension}`
  const filePath = path.join(uploadDir, fileName)
  const buffer = Buffer.from(match[2], 'base64')

  await writeFile(filePath, buffer)

  return `/uploads/destinations/${fileName}`
}

export async function PUT(request: Request, { params }: RouteParams) {
  const rawId = params.id
  const destinationId = Number.parseInt(rawId, 10)

  if (!Number.isFinite(destinationId)) {
    return NextResponse.json(
      { success: false, message: 'Invalid destination id' },
      { status: 400 },
    )
  }

  const body = await request.json()
  const { name, description, category, region, imageUrl } = body as {
    name?: string
    description?: string
    category?: string | null
    region?: string | null
    imageUrl?: string | string[] | null
  }

  if (!name || !description) {
    return NextResponse.json(
      { success: false, message: 'Name and description are required' },
      { status: 400 },
    )
  }

  try {
    const normalizedImageUrl = normalizeDestinationImageUrl(imageUrl)
    const savedImageUrl = await saveDestinationImageFile(normalizedImageUrl, destinationId)

    const updatedDestination = await prisma.destination.update({
      where: { id: destinationId },
      data: {
        name: name.trim(),
        description: description.trim(),
        category: category?.trim() || null,
        region: region?.trim() || null,
        imageUrl: savedImageUrl,
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        region: true,
        imageUrl: true,
      },
    })

    return NextResponse.json({
      success: true,
      destination: {
        ...updatedDestination,
        image_url: updatedDestination.imageUrl,
      },
    })
  } catch (err) {
    console.error('Error in PUT /api/admin/destinations/[id]:', err)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const rawId = params.id
  const destinationId = Number.parseInt(rawId, 10)

  if (!Number.isFinite(destinationId)) {
    return NextResponse.json(
      { success: false, message: 'Invalid destination id' },
      { status: 400 },
    )
  }

  try {
    await prisma.$transaction([
      prisma.userLikedDestination.deleteMany({
        where: { destinationId },
      }),
      prisma.weatherData.deleteMany({
        where: { locationId: destinationId },
      }),
      prisma.destination.delete({
        where: { id: destinationId },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error in DELETE /api/admin/destinations/[id]:', err)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    )
  }
}
