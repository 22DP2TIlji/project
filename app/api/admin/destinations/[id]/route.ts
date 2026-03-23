import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { normalizeDestinationImageUrl } from '../../destination-images'

type RouteParams = { params: { id: string } }

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
    const updatedDestination = await prisma.destination.update({
      where: { id: destinationId },
      data: {
        name: name.trim(),
        description: description.trim(),
        category: category?.trim() || null,
        region: region?.trim() || null,
        imageUrl: normalizeDestinationImageUrl(imageUrl),
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
