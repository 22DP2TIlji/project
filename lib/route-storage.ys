const MAX_ROUTE_NAME_LENGTH = 100
const MAX_ROUTE_DESCRIPTION_LENGTH = 60000
const MAX_GEOMETRY_POINTS = 500

type LineStringGeometry = {
  type?: string
  coordinates?: unknown
}

function truncateText(value: string, maxLength: number): string {
  return value.length > maxLength ? value.slice(0, maxLength) : value
}

function compactPlace(place: any) {
  return {
    id: place?.id,
    name: place?.name,
    city: place?.city,
    category: place?.category,
    region: place?.region,
    latitude: place?.latitude,
    longitude: place?.longitude,
    averageCost: place?.averageCost,
    averageVisitMinutes: place?.averageVisitMinutes,
    rating: place?.rating,
  }
}

function simplifyGeometry(geometry: LineStringGeometry | null | undefined, maxPoints = MAX_GEOMETRY_POINTS) {
  if (!geometry || !Array.isArray(geometry.coordinates)) return geometry ?? null

  const coordinates = geometry.coordinates as unknown[]
  if (coordinates.length <= maxPoints) return geometry

  const step = Math.ceil(coordinates.length / maxPoints)
  const simplified = coordinates.filter((_, index) => index % step === 0)
  const last = coordinates[coordinates.length - 1]

  if (simplified[simplified.length - 1] !== last) {
    simplified.push(last)
  }

  return {
    ...geometry,
    coordinates: simplified,
  }
}

export function createRouteName(name: string | null | undefined): string {
  const trimmed = name?.trim() || 'Saglabāts maršruts'
  return truncateText(trimmed, MAX_ROUTE_NAME_LENGTH)
}

export function serializeItineraryForRouteDescription(itinerary: any): string {
  const compact = {
    ...itinerary,
    geometry: simplifyGeometry(itinerary?.geometry),
    tripDays: Array.isArray(itinerary?.tripDays)
      ? itinerary.tripDays.map((day: any) => ({
          ...day,
          places: Array.isArray(day?.places) ? day.places.map(compactPlace) : [],
        }))
      : itinerary?.tripDays,
  }

  let serialized = JSON.stringify(compact)

  if (serialized.length > MAX_ROUTE_DESCRIPTION_LENGTH && compact.geometry) {
    serialized = JSON.stringify({ ...compact, geometry: null })
  }

  if (serialized.length > MAX_ROUTE_DESCRIPTION_LENGTH) {
    const minimalTripDays = Array.isArray(compact.tripDays)
      ? compact.tripDays.map((day: any) => ({
          dayNumber: day?.dayNumber,
          places: Array.isArray(day?.places)
            ? day.places.map((place: any) => ({
                id: place?.id,
                name: place?.name,
                latitude: place?.latitude,
                longitude: place?.longitude,
              }))
            : [],
        }))
      : compact.tripDays

    serialized = JSON.stringify({
      kind: compact.kind,
      tripName: compact.tripName,
      startPoint: compact.startPoint,
      endPoint: compact.endPoint,
      startCoords: compact.startCoords,
      endCoords: compact.endCoords,
      distance: compact.distance,
      time: compact.time,
      totalDistance: compact.totalDistance,
      estimatedCost: compact.estimatedCost,
      totalPlaces: compact.totalPlaces,
      date: compact.date,
      isPublic: compact.isPublic,
      tripDays: minimalTripDays,
    })
  }

  if (serialized.length > MAX_ROUTE_DESCRIPTION_LENGTH) {
    serialized = JSON.stringify({
      kind: compact.kind,
      tripName: compact.tripName,
      startPoint: compact.startPoint,
      endPoint: compact.endPoint,
      startCoords: compact.startCoords,
      endCoords: compact.endCoords,
      distance: compact.distance,
      time: compact.time,
      totalDistance: compact.totalDistance,
      estimatedCost: compact.estimatedCost,
      totalPlaces: compact.totalPlaces,
      date: compact.date,
      isPublic: compact.isPublic,
    })
  }

  return serialized
}