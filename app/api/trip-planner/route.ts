import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Центры городов Латвии (lat, lng)
const CITY_CENTERS: Record<string, [number, number]> = {
  riga: [56.9496, 24.1052],
  jurmala: [56.9715, 23.7408],
  sigulda: [57.1537, 24.8598],
  cesis: [57.3119, 25.2749],
  kuldiga: [56.9677, 21.9617],
  liepaja: [56.5047, 21.0107],
  daugavpils: [55.8714, 26.5161],
  ventspils: [57.3894, 21.5606],
}

const DEFAULT_AVERAGE_COST = 5 // EUR, если не указано
const DEFAULT_VISIT_MINUTES = 60
const PLACES_PER_DAY = 3 // оптимальное кол-во мест в день
const MAX_PLACES_CAP = 30

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // км
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Nearest Neighbor для построения маршрута
function optimizeRoute(
  places: Array<{ id: number; latitude: number; longitude: number; [k: string]: unknown }>,
  startLat: number,
  startLng: number
) {
  if (places.length === 0) return { ordered: [], totalDistance: 0 }
  if (places.length === 1) {
    const dist = haversine(startLat, startLng, Number(places[0].latitude), Number(places[0].longitude))
    return { ordered: places, totalDistance: dist }
  }

  const ordered: typeof places = []
  let currentLat = startLat
  let currentLng = startLng
  let totalDistance = 0
  const remaining = [...places]

  while (remaining.length > 0) {
    let nearestIdx = -1
    let nearestDist = Infinity

    remaining.forEach((p, i) => {
      const lat = Number(p.latitude)
      const lng = Number(p.longitude)
      const d = haversine(currentLat, currentLng, lat, lng)
      if (d < nearestDist) {
        nearestDist = d
        nearestIdx = i
      }
    })

    if (nearestIdx === -1) break

    const next = remaining.splice(nearestIdx, 1)[0]
    ordered.push(next)
    totalDistance += nearestDist
    currentLat = Number(next.latitude)
    currentLng = Number(next.longitude)
  }

  return { ordered, totalDistance: Math.round(totalDistance * 10) / 10 }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { days = 1, interests = [], budget = 0, startCity = 'riga' } = body as {
      days?: number
      interests?: string[]
      budget?: number
      startCity?: string
    }

    const center = CITY_CENTERS[startCity.toLowerCase()] ?? CITY_CENTERS.riga
    const [startLat, startLng] = center

    const targetCount = Math.min(
      days * PLACES_PER_DAY,
      MAX_PLACES_CAP
    )

    const where: Record<string, unknown> = {}
    if (interests && interests.length > 0) {
      where.category = { in: interests }
    }

    const destinations = await prisma.destination.findMany({
      where: Object.keys(where).length ? where : undefined,
    })

    type DestRow = typeof destinations[0] & { averageCost?: unknown; averageVisitMinutes?: number | null; rating?: unknown }
    let places = destinations
      .filter((d) => d.latitude != null && d.longitude != null)
      .map((d) => {
        const row = d as DestRow
        return {
          id: d.id,
          name: d.name,
          city: d.city,
          description: d.description,
          category: d.category,
          region: d.region,
          latitude: Number(d.latitude),
          longitude: Number(d.longitude),
          averageCost: row.averageCost != null ? Number(row.averageCost) : DEFAULT_AVERAGE_COST,
          averageVisitMinutes: row.averageVisitMinutes ?? DEFAULT_VISIT_MINUTES,
          rating: row.rating != null ? Number(row.rating) : null as number | null,
        }
      })

    // Фильтр по бюджету (если указан)
    if (budget > 0) {
      const maxPerPlace = budget / targetCount
      places = places.filter((p) => p.averageCost <= maxPerPlace)
    }

    // Сортируем по близости к стартовой точке, берём топ
    places = places
      .map((p) => ({
        ...p,
        dist: haversine(startLat, startLng, p.latitude, p.longitude),
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, targetCount)
      .map(({ dist, ...rest }) => rest)

    const { ordered, totalDistance } = optimizeRoute(places, startLat, startLng)

    // Распределение по дням
    const placesPerDay = Math.ceil(ordered.length / days) || 1
    const tripDays: Array<{ dayNumber: number; places: typeof ordered }> = []
    for (let d = 0; d < days; d++) {
      const start = d * placesPerDay
      const end = Math.min(start + placesPerDay, ordered.length)
      const dayPlaces = ordered.slice(start, end)
      if (dayPlaces.length > 0) {
        tripDays.push({ dayNumber: d + 1, places: dayPlaces })
      }
    }

    let totalCost = 0
    let totalMinutes = 0
    for (const p of ordered) {
      const place = p as { averageCost?: number; averageVisitMinutes?: number }
      totalCost += place.averageCost ?? 0
      totalMinutes += place.averageVisitMinutes ?? 0
    }

    return NextResponse.json({
      success: true,
      trip: {
        startCity,
        days: tripDays.length,
        tripDays,
        totalPlaces: ordered.length,
        totalDistance,
        estimatedCost: Math.round(totalCost * 10) / 10,
        estimatedTimeMinutes: totalMinutes,
        startPoint: { lat: startLat, lng: startLng },
      },
    })
  } catch (error) {
    console.error('Trip planner error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
