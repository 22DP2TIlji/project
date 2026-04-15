import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0 

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const destinationId = Number(params.id)
  if (!Number.isFinite(destinationId)) {
    return NextResponse.json({ success: false, message: 'Invalid id' }, { status: 400 })
  }

  const destination = await prisma.destination.findUnique({
    where: { id: destinationId },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      region: true,
      city: true,
      latitude: true,
      longitude: true,
      imageUrl: true,
    },
  })

  if (!destination) {
    return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })
  }

return NextResponse.json(
    {
      success: true,
      destination: {
        ...destination,
        latitude: destination.latitude ? Number(destination.latitude) : null,
        longitude: destination.longitude ? Number(destination.longitude) : null,
        image_url: normalizeImageUrl(destination.imageUrl),
      },
    },
  { headers: { 'Cache-Control': 'no-store' } }
  )
}

function normalizeImageUrl(value: string | null): string | null {
  if (!value) return null
  const raw = value.trim()
  if (!raw) return null

  if (raw.startsWith("//")) return `https:${raw}`
  if (raw.startsWith("http://")) return raw.replace("http://", "https://")
  return raw
}

