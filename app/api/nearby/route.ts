import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// API для поиска мест рядом с маршрутом или точкой
// Параметры: lat, lng, radius (км), type (destinations|accommodations|events|all)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = searchParams.get('radius') || '50' // по умолчанию 50 км
    const type = searchParams.get('type') || 'all' // destinations, accommodations, events, all
    const routeStartLat = searchParams.get('routeStartLat')
    const routeStartLng = searchParams.get('routeStartLng')
    const routeEndLat = searchParams.get('routeEndLat')
    const routeEndLng = searchParams.get('routeEndLng')

    const hasRoute = routeStartLat && routeStartLng && routeEndLat && routeEndLng
    const hasPoint = lat && lng

    if (!hasRoute && !hasPoint) {
      return NextResponse.json(
        { success: false, message: 'Either (lat, lng) or (routeStartLat, routeStartLng, routeEndLat, routeEndLng) are required' },
        { status: 400 }
      )
    }

    const centerLat = lat ? parseFloat(lat) : (parseFloat(routeStartLat!) + parseFloat(routeEndLat!)) / 2
    const centerLng = lng ? parseFloat(lng) : (parseFloat(routeStartLng!) + parseFloat(routeEndLng!)) / 2
    const radiusKm = parseFloat(radius)

    const results: {
      destinations: any[]
      accommodations: any[]
      events: any[]
    } = {
      destinations: [],
      accommodations: [],
      events: [],
    }

    // Если указан маршрут, ищем места рядом с маршрутом (вдоль линии)
    if (routeStartLat && routeStartLng && routeEndLat && routeEndLng) {
      const startLat = parseFloat(routeStartLat)
      const startLng = parseFloat(routeStartLng)
      const endLat = parseFloat(routeEndLat)
      const endLng = parseFloat(routeEndLng)

      // Получаем все места
      if (type === 'all' || type === 'destinations') {
        const allDestinations = await prisma.destination.findMany()
        results.destinations = allDestinations
          .filter((d) => {
            if (!d.latitude || !d.longitude) return false
            const destLat = Number(d.latitude)
            const destLng = Number(d.longitude)
            const distance = distanceToLineSegment(
              destLat,
              destLng,
              startLat,
              startLng,
              endLat,
              endLng
            )
            return distance <= radiusKm
          })
          .map((d) => ({
            ...d,
            distance: distanceToLineSegment(
              Number(d.latitude),
              Number(d.longitude),
              startLat,
              startLng,
              endLat,
              endLng
            ),
          }))
          .sort((a, b) => a.distance - b.distance)
      }

      if (type === 'all' || type === 'accommodations') {
        const allAccommodations = await prisma.accommodation.findMany()
        results.accommodations = allAccommodations
          .map((acc) => {
            const accLat = Number(acc.latitude)
            const accLng = Number(acc.longitude)
            const distance = distanceToLineSegment(accLat, accLng, startLat, startLng, endLat, endLng)
            return { ...acc, distance }
          })
          .filter((acc) => acc.distance <= radiusKm)
          .sort((a, b) => a.distance - b.distance)
      }

      if (type === 'all' || type === 'events') {
        const allEvents = await prisma.event.findMany()
        results.events = allEvents
          .map((ev) => {
            const evLat = Number(ev.latitude)
            const evLng = Number(ev.longitude)
            const distance = distanceToLineSegment(evLat, evLng, startLat, startLng, endLat, endLng)
            return { ...ev, distance }
          })
          .filter((ev) => ev.distance <= radiusKm)
          .sort((a, b) => a.distance - b.distance)
      }
    } else {
      // Поиск вокруг точки
      if (type === 'all' || type === 'destinations') {
        const allDestinations = await prisma.destination.findMany()
        results.destinations = allDestinations
          .filter((d) => {
            if (!d.latitude || !d.longitude) return false
            const destLat = Number(d.latitude)
            const destLng = Number(d.longitude)
            const distance = calculateDistance(centerLat, centerLng, destLat, destLng)
            return distance <= radiusKm
          })
          .map((d) => ({
            ...d,
            distance: calculateDistance(centerLat, centerLng, Number(d.latitude), Number(d.longitude)),
          }))
          .sort((a, b) => a.distance - b.distance)
      }

      if (type === 'all' || type === 'accommodations') {
        const allAccommodations = await prisma.accommodation.findMany()
        results.accommodations = allAccommodations
          .filter((acc) => {
            const accLat = Number(acc.latitude)
            const accLng = Number(acc.longitude)
            const distance = calculateDistance(centerLat, centerLng, accLat, accLng)
            return distance <= radiusKm
          })
          .map((acc) => ({
            ...acc,
            distance: calculateDistance(centerLat, centerLng, Number(acc.latitude), Number(acc.longitude)),
          }))
          .sort((a, b) => a.distance - b.distance)
      }

      if (type === 'all' || type === 'events') {
        const allEvents = await prisma.event.findMany()
        results.events = allEvents
          .filter((ev) => {
            const evLat = Number(ev.latitude)
            const evLng = Number(ev.longitude)
            const distance = calculateDistance(centerLat, centerLng, evLat, evLng)
            return distance <= radiusKm
          })
          .map((ev) => ({
            ...ev,
            distance: calculateDistance(centerLat, centerLng, Number(ev.latitude), Number(ev.longitude)),
          }))
          .sort((a, b) => a.distance - b.distance)
      }
    }

    return NextResponse.json({ success: true, ...results })
  } catch (error) {
    console.error('Error fetching nearby places:', error)
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

// Расстояние от точки до отрезка линии (маршрута)
function distanceToLineSegment(
  pointLat: number,
  pointLng: number,
  lineStartLat: number,
  lineStartLng: number,
  lineEndLat: number,
  lineEndLng: number
): number {
  // Упрощенный расчет: минимальное расстояние от точки до любой точки на отрезке
  // Используем расстояние до ближайшей точки на отрезке
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
