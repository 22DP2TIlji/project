import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const search = searchParams.get('search')?.trim() || undefined
    const category = searchParams.get('category')?.trim() || undefined
    const region = searchParams.get('region')?.trim() || undefined
    const countOnly = searchParams.get('countOnly') === 'true'
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = searchParams.get('radius') // в километрах

    const limit = limitParam ? Math.min(Math.max(1, parseInt(limitParam, 10)), 100) : undefined

    const where: Record<string, unknown> = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ]
    }
    if (category && category !== 'all') {
      where.category = category
    }
    if (region && region !== 'all') {
      where.region = region
    }

    // Поиск по радиусу (если указаны координаты)
    if (lat && lng && radius) {
      const centerLat = parseFloat(lat)
      const centerLng = parseFloat(lng)
      const radiusKm = parseFloat(radius)
      
      // Получаем все destinations и фильтруем по расстоянию
      const allDestinations = await prisma.destination.findMany({
        where: Object.keys(where).length ? where : undefined,
      })

      const nearbyDestinations = allDestinations.filter((dest) => {
        if (!dest.latitude || !dest.longitude) return false
        const destLat = Number(dest.latitude)
        const destLng = Number(dest.longitude)
        const distance = calculateDistance(centerLat, centerLng, destLat, destLng)
        return distance <= radiusKm
      })

      if (countOnly) {
        return NextResponse.json({ success: true, count: nearbyDestinations.length })
      }

      const limited = limit ? nearbyDestinations.slice(0, limit) : nearbyDestinations
      const destinations = limited.map((d) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        city: d.city,
        category: d.category,
        region: d.region,
        latitude: d.latitude ? Number(d.latitude) : null,
        longitude: d.longitude ? Number(d.longitude) : null,
        image_url: null,
      }))
      return NextResponse.json({ success: true, destinations })
    }

    if (countOnly) {
      const count = await prisma.destination.count({
        where: Object.keys(where).length ? where : undefined,
      })
      return NextResponse.json({ success: true, count })
    }

    const rows = await prisma.destination.findMany({
      where: Object.keys(where).length ? where : undefined,
      take: limit,
      orderBy: { id: 'desc' },
    })

    const destinations = rows.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      city: d.city,
      category: d.category,
      region: d.region,
      latitude: d.latitude ? Number(d.latitude) : null,
      longitude: d.longitude ? Number(d.longitude) : null,
      image_url: null,
    }))

    return NextResponse.json({ success: true, destinations })
  } catch (error) {
    console.error('Error fetching destinations:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Радиус Земли в километрах
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}
