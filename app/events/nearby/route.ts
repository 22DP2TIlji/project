import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// API для получения событий рядом с направлением или в маршруте
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = searchParams.get('radius') || '50'
    const destinationId = searchParams.get('destinationId')
    const routeStartLat = searchParams.get('routeStartLat')
    const routeStartLng = searchParams.get('routeStartLng')
    const routeEndLat = searchParams.get('routeEndLat')
    const routeEndLng = searchParams.get('routeEndLng')

    let events = await prisma.event.findMany()

    // Если указан destinationId, получаем координаты направления
    if (destinationId) {
      const destination = await prisma.destination.findUnique({
        where: { id: parseInt(destinationId) },
      })
      if (destination && destination.latitude && destination.longitude) {
        const destLat = Number(destination.latitude)
        const destLng = Number(destination.longitude)
        const radiusKm = parseFloat(radius)

        events = events.filter((ev) => {
          const evLat = Number(ev.latitude)
          const evLng = Number(ev.longitude)
          const distance = calculateDistance(destLat, destLng, evLat, evLng)
          return distance <= radiusKm
        })
      }
    } else if (lat && lng) {
      // Фильтр по точке
      const centerLat = parseFloat(lat)
      const centerLng = parseFloat(lng)
      const radiusKm = parseFloat(radius)

      events = events.filter((ev) => {
        const evLat = Number(ev.latitude)
        const evLng = Number(ev.longitude)
        const distance = calculateDistance(centerLat, centerLng, evLat, evLng)
        return distance <= radiusKm
      })
    } else if (routeStartLat && routeStartLng && routeEndLat && routeEndLng) {
      // Фильтр по маршруту
      const startLat = parseFloat(routeStartLat)
      const startLng = parseFloat(routeStartLng)
      const endLat = parseFloat(routeEndLat)
      const endLng = parseFloat(routeEndLng)
      const radiusKm = parseFloat(radius)

      events = events.filter((ev) => {
        const evLat = Number(ev.latitude)
        const evLng = Number(ev.longitude)
        const distance = distanceToLineSegment(evLat, evLng, startLat, startLng, endLat, endLng)
        return distance <= radiusKm
      })
    }

    // Фильтруем только будущие события или текущие
    const now = new Date()
    events = events.filter((ev) => new Date(ev.endDate) >= now)

    // Сортируем по дате начала
    events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

    return NextResponse.json({ success: true, events })
  } catch (error) {
    console.error('Error fetching nearby events:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function distanceToLineSegment(
  pointLat: number,
  pointLng: number,
  lineStartLat: number,
  lineStartLng: number,
  lineEndLat: number,
  lineEndLng: number
): number {
  const distToStart = calculateDistance(pointLat, pointLng, lineStartLat, lineStartLng)
  const distToEnd = calculateDistance(pointLat, pointLng, lineEndLat, lineEndLng)
  const distToMid = calculateDistance(
    pointLat,
    pointLng,
    (lineStartLat + lineEndLat) / 2,
    (lineStartLng + lineEndLng) / 2
  )
  return Math.min(distToStart, distToEnd, distToMid)
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}
