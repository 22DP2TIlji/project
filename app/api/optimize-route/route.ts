import { NextRequest, NextResponse } from 'next/server'

// API для оптимизации порядка посещения мест в маршруте
// Использует простой алгоритм ближайшего соседа (Nearest Neighbor)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { places } = body // массив {id, name, latitude, longitude}

    if (!places || !Array.isArray(places) || places.length < 2) {
      return NextResponse.json({ success: false, message: 'At least 2 places required' }, { status: 400 })
    }

    // Алгоритм ближайшего соседа
    const optimized = optimizeRoute(places)

    return NextResponse.json({ success: true, optimizedRoute: optimized })
  } catch (error) {
    console.error('Error optimizing route:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

function optimizeRoute(places: any[]) {
  if (places.length <= 2) return places

  const visited = new Set<number>()
  const optimized: any[] = []
  
  // Начинаем с первого места
  let current = places[0]
  optimized.push(current)
  visited.add(0)

  // Находим ближайшее непосещенное место на каждой итерации
  while (optimized.length < places.length) {
    let nearestIndex = -1
    let nearestDistance = Infinity

    places.forEach((place, index) => {
      if (visited.has(index)) return

      const lat1 = Number(current.latitude)
      const lng1 = Number(current.longitude)
      const lat2 = Number(place.latitude)
      const lng2 = Number(place.longitude)

      const distance = calculateDistance(lat1, lng1, lat2, lng2)

      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = index
      }
    })

    if (nearestIndex !== -1) {
      current = places[nearestIndex]
      optimized.push(current)
      visited.add(nearestIndex)
    } else {
      break
    }
  }

  // Добавляем оставшиеся места
  places.forEach((place, index) => {
    if (!visited.has(index)) {
      optimized.push(place)
    }
  })

  // Вычисляем общее расстояние
  let totalDistance = 0
  for (let i = 0; i < optimized.length - 1; i++) {
    const lat1 = Number(optimized[i].latitude)
    const lng1 = Number(optimized[i].longitude)
    const lat2 = Number(optimized[i + 1].latitude)
    const lng2 = Number(optimized[i + 1].longitude)
    totalDistance += calculateDistance(lat1, lng1, lat2, lng2)
  }

  return {
    places: optimized,
    totalDistance: Math.round(totalDistance * 10) / 10,
    estimatedTime: Math.round((totalDistance / 60) * 10) / 10, // часов
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

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}
