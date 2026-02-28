import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')?.trim() || undefined
    const city = searchParams.get('city')?.trim() || undefined
    const freeOnly = searchParams.get('freeOnly') === 'true'

    const conditions: Record<string, unknown>[] = []
    if (category && category !== 'all') conditions.push({ category })
    if (city && city !== 'all') conditions.push({ city })
    if (freeOnly) conditions.push({ OR: [{ averageCost: 0 }, { averageCost: null }] })
    const where = conditions.length > 0 ? { AND: conditions } : undefined

    const count = await prisma.destination.count({ where })
    if (count === 0) {
      return NextResponse.json({ success: true, place: null, message: 'No places found' })
    }

    const skip = Math.floor(Math.random() * count)
    const place = await prisma.destination.findFirst({
      where,
      skip,
    })

    if (!place) {
      return NextResponse.json({ success: true, place: null })
    }

    return NextResponse.json({
      success: true,
      place: {
        id: place.id,
        name: place.name,
        city: place.city,
        description: place.description,
        category: place.category,
        region: place.region,
        latitude: place.latitude ? Number(place.latitude) : null,
        longitude: place.longitude ? Number(place.longitude) : null,
        averageCost: place.averageCost ? Number(place.averageCost) : null,
        averageVisitMinutes: place.averageVisitMinutes,
        rating: place.rating ? Number(place.rating) : null,
      },
    })
  } catch (error) {
    console.error('Random place error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
