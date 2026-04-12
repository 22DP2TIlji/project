import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromId } from '@/lib/auth-utils'
import { Prisma } from '@prisma/client'

type TripDay = { dayNumber: number; places: Array<{ id: number; name: string; latitude?: number; longitude?: number }> }

type TripPayload = {
  startCity?: string
  tripDays?: TripDay[]
  totalPlaces?: number
  totalDistance?: number
  estimatedCost?: number
  estimatedTimeMinutes?: number
  startPoint?: { lat: number; lng: number }
}

const MAX_OSRM_WAYPOINTS = 25

async function fetchRoadGeometry(coordsLngLat: [number, number][]) {
  if (coordsLngLat.length < 2) return null
  const limited = coordsLngLat.slice(0, MAX_OSRM_WAYPOINTS)
  const path = limited.map(([lng, lat]) => `${lng},${lat}`).join(';')
  const url = `https://router.project-osrm.org/route/v1/driving/${path}?overview=full&geometries=geojson`
  const res = await fetch(url, { next: { revalidate: 0 } })
  if (!res.ok) return null
  const data = (await res.json()) as {
    routes?: Array<{ geometry?: { type: string; coordinates: [number, number][] }; distance?: number; duration?: number }>
  }
  const r = data?.routes?.[0]
  if (!r?.geometry?.coordinates?.length) return null
  return {
    geometry: r.geometry,
    distanceKm: Math.round(((r.distance ?? 0) / 1000) * 10) / 10,
    timeMinutes: Math.round((r.duration ?? 0) / 60),
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      userId?: string
      tripName?: string
      trip?: TripPayload
    }

    const { userId, tripName, trip } = body
    if (!userId || !tripName?.trim() || !trip?.tripDays?.length) {
      return NextResponse.json(
        { success: false, message: 'Nepieciešams lietotāja identifikators, ceļojuma nosaukums un plāns.' },
        { status: 400 }
      )
    }

    if (userId === 'admin') {
      return NextResponse.json({ success: false, message: 'Administratoram nav personīgo ceļojumu.' }, { status: 403 })
    }

    const user = await getUserFromId(userId)
    if (!user?.id || user.id === 'admin') {
      return NextResponse.json({ success: false, message: 'Lietotājs nav atrasts.' }, { status: 404 })
    }

    const numericUserId = parseInt(user.id, 10)
    if (!Number.isFinite(numericUserId)) {
      return NextResponse.json({ success: false, message: 'Nederīgs lietotāja identifikators.' }, { status: 400 })
    }

    const orderedPlaces: TripDay['places'] = []
    for (const day of trip.tripDays) {
      for (const p of day.places || []) {
        if (p?.id != null && p?.latitude != null && p?.longitude != null) {
          orderedPlaces.push({
            ...p,
            latitude: Number(p.latitude),
            longitude: Number(p.longitude),
          })
        }
      }
    }

    if (orderedPlaces.length === 0) {
      return NextResponse.json({ success: false, message: 'Nav vietu ar koordinātām, ko saglabāt.' }, { status: 400 })
    }

    const first = orderedPlaces[0]
    const last = orderedPlaces[orderedPlaces.length - 1]
    const startCoords: [number, number] = [Number(first.latitude), Number(first.longitude)]
    const endCoords: [number, number] = [Number(last.latitude), Number(last.longitude)]

    const coordsLngLat: [number, number][] = orderedPlaces.map((p) => [
      Number(p.longitude),
      Number(p.latitude),
    ])

    let geometry: { type: string; coordinates: [number, number][] } | null = null
    let distanceKm = typeof trip.totalDistance === 'number' ? trip.totalDistance : 0
    let timeHours = 0

    try {
      const road = await fetchRoadGeometry(coordsLngLat)
      if (road) {
        geometry = road.geometry as { type: string; coordinates: [number, number][] }
        distanceKm = road.distanceKm
        timeHours = road.timeMinutes / 60
      }
    } catch {
      // paliek plānotā attālums
    }

    if (!geometry && orderedPlaces.length >= 2) {
      timeHours =
        typeof trip.estimatedTimeMinutes === 'number'
          ? trip.estimatedTimeMinutes / 60
          : Math.max(0.5, distanceKm / 50)
    }

    const itinerary = {
      kind: 'tripPlan' as const,
      tripName: tripName.trim(),
      tripDays: trip.tripDays,
      startCity: trip.startCity,
      totalPlaces: trip.totalPlaces ?? orderedPlaces.length,
      totalDistance: distanceKm,
      estimatedCost: trip.estimatedCost ?? 0,
      startCoords,
      endCoords,
      startPoint: tripName.trim(),
      endPoint: last.name,
      distance: distanceKm,
      time: timeHours > 0 ? timeHours : 1,
      geometry,
      date: new Date().toISOString(),
      isPublic: false,
    }

    const created = await prisma.route.create({
      data: {
        userId: numericUserId,
        name: tripName.trim(),
        description: JSON.stringify(itinerary),
        startLat: startCoords[0],
        startLng: startCoords[1],
        endLat: endCoords[0],
        endLng: endCoords[1],
        isPublic: false,
      } as Prisma.RouteUncheckedCreateInput,
    })

    return NextResponse.json({ success: true, routeId: created.id })
  } catch (error) {
    console.error('trip-planner/save error:', error)
    return NextResponse.json({ success: false, message: 'Servera kļūda.' }, { status: 500 })
  }
}
