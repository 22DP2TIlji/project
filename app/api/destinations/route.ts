import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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
    const radius = searchParams.get('radius') // kilometros

    const limit = limitParam ? Math.min(Math.max(1, parseInt(limitParam, 10)), 100) : undefined

    const normalizedSearch = search?.toLowerCase()
    const normalizedCategory = category && category !== 'all' ? category.toLowerCase() : null
    const normalizedRegion = region && region !== 'all' ? region.toLowerCase() : null

    const matchesFilters = (dest: {
      name: string
      description: string | null
      category: string | null
      region: string | null
    }) => {
      const name = dest.name?.toLowerCase() ?? ''
      const description = dest.description?.toLowerCase() ?? ''
      const destCategory = dest.category?.toLowerCase() ?? ''
      const destRegion = dest.region?.toLowerCase() ?? ''

      const matchesSearch =
        !normalizedSearch ||
        name.includes(normalizedSearch) ||
        description.includes(normalizedSearch)

      const matchesCategory = !normalizedCategory || destCategory === normalizedCategory
      const matchesRegion = !normalizedRegion || destRegion === normalizedRegion

      return matchesSearch && matchesCategory && matchesRegion
    }

    // Meklēšana pēc rādiusa, ja ir norādītas koordinātas
    const allDestinations = await loadAllDestinations()

    if (lat && lng && radius) {
      const centerLat = parseFloat(lat)
      const centerLng = parseFloat(lng)
      const radiusKm = parseFloat(radius)

      const filteredDestinations = allDestinations.filter(matchesFilters)

      const nearbyDestinations = filteredDestinations.filter((dest) => {
        if (!dest.latitude || !dest.longitude) return false

        const destLat = Number(dest.latitude)
        const destLng = Number(dest.longitude)
        const distance = calculateDistance(centerLat, centerLng, destLat, destLng)

        return distance <= radiusKm
      })

      if (countOnly) {
        return NextResponse.json(
          { success: true, count: nearbyDestinations.length },
          { headers: { 'Cache-Control': 'no-store' } }
        )
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
        image_url: normalizeImageUrl(d.imageRaw ?? null),
      }))

      return NextResponse.json(
        { success: true, count: nearbyDestinations.length, destinations },
        { headers: { 'Cache-Control': 'no-store' } }
      )
    }

    if (countOnly) {
      const count = allDestinations.filter(matchesFilters).length

      return NextResponse.json(
        { success: true, count },
        { headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const filteredRows = allDestinations.filter(matchesFilters)
    const limitedRows = limit ? filteredRows.slice(0, limit) : filteredRows

    const destinations = limitedRows.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      city: d.city,
      category: d.category,
      region: d.region,
      latitude: d.latitude ? Number(d.latitude) : null,
      longitude: d.longitude ? Number(d.longitude) : null,
      image_url: normalizeImageUrl(d.imageRaw ?? null),
    }))

    return NextResponse.json(
      { success: true, destinations },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    if (
      (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') ||
      (error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2010' &&
        String((error.meta as { message?: string } | undefined)?.message || '')
          .toLowerCase()
          .includes("doesn't exist"))
    ) {
      // Tabula destinations pašreizējā datubāzē nav izveidota — atgriežam drošu tukšu atbildi
      return NextResponse.json(
        {
          success: true,
          destinations: [],
          count: 0,
          message: 'Tabula destinations nav atrasta datubāzē',
        },
        { headers: { 'Cache-Control': 'no-store' } }
      )
    }

    console.error('Kļūda galamērķu iegūšanas laikā:', error)

    return NextResponse.json(
      { success: false, message: 'Iekšēja servera kļūda' },
      { status: 500 }
    )
  }
}

async function loadAllDestinations(): Promise<Array<{
  id: number
  name: string
  description: string | null
  city: string | null
  category: string | null
  region: string | null
  latitude: number | null
  longitude: number | null
  imageRaw: string | null
}>> {
  try {
    const rows = await prisma.$queryRawUnsafe<
      Array<{
        id: number
        name: string
        description: string | null
        city: string | null
        category: string | null
        region: string | null
        latitude: number | null
        longitude: number | null
        imageRaw: string | null
      }>
    >(
      `SELECT id, name, description, city, category, region, latitude, longitude, image_url AS imageRaw
       FROM destinations
       ORDER BY id DESC`
    )

    return rows.map((row) => ({
      ...row,
      id: Number(row.id),
      latitude: row.latitude != null ? Number(row.latitude) : null,
      longitude: row.longitude != null ? Number(row.longitude) : null,
    }))
  } catch {
    try {
      const rows = await prisma.$queryRawUnsafe<
        Array<{
          id: number
          name: string
          description: string | null
          city: string | null
          category: string | null
          region: string | null
          latitude: number | null
          longitude: number | null
          imageRaw: string | null
        }>
      >(
        `SELECT id, name, description, city, category, region, latitude, longitude, imageUrl AS imageRaw
         FROM destinations
         ORDER BY id DESC`
      )

      return rows.map((row) => ({
        ...row,
        id: Number(row.id),
        latitude: row.latitude != null ? Number(row.latitude) : null,
        longitude: row.longitude != null ? Number(row.longitude) : null,
      }))
    } catch {
      throw new Error('Neizdevās izgūt galamērķus ne ar image_url, ne ar imageUrl kolonnu')
    }
  }
}

function normalizeImageUrl(value: string | null): string | null {
  if (!value) return null

  let raw = value.trim()
  if (!raw) return null

  // Dažreiz datubāzē tīras saites vietā var būt serializēts JSON masīvs vai objekts
  if (raw.startsWith('{') || raw.startsWith('[')) {
    try {
      const parsed = JSON.parse(raw)
      const candidate =
        (Array.isArray(parsed) ? parsed.find((item) => typeof item === 'string') : null) ||
        (typeof parsed?.url === 'string' ? parsed.url : null) ||
        (typeof parsed?.source === 'string' ? parsed.source : null) ||
        (typeof parsed?.thumbnail?.source === 'string' ? parsed.thumbnail.source : null) ||
        (typeof parsed?.originalimage?.source === 'string' ? parsed.originalimage.source : null)

      if (typeof candidate === 'string' && candidate.trim()) {
        raw = candidate.trim()
      }
    } catch {
      // Atstājam sākotnējo vērtību
    }
  }

  if (raw.startsWith('//')) return `https:${raw}`
  if (raw.startsWith('http://')) return raw.replace('http://', 'https://')

  return raw
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Zemes rādiuss kilometros
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return distance
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}