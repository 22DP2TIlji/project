import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// API для получения статистики пользователя
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 })
    }

    const userIdNum = userId === 'admin' ? 0 : parseInt(userId)
    if (userId !== 'admin' && isNaN(userIdNum)) {
      return NextResponse.json({ success: false, message: 'Invalid user ID' }, { status: 400 })
    }

    // Количество сохраненных направлений
    const savedDestinationsCount = await prisma.userLikedDestination.count({
      where: { userId: userIdNum },
    })

    // Количество созданных маршрутов
    const routesCount = await prisma.route.count({
      where: { userId: userIdNum },
    })

    // Количество оставленных отзывов
    const reviewsCount = await prisma.review.count({
      where: { userId: userIdNum },
    })

    // Средний рейтинг отзывов пользователя
    const reviews = await prisma.review.findMany({
      where: { userId: userIdNum },
      select: { rating: true },
    })
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0

    // Категории сохраненных направлений
    const likedDestinations = await prisma.userLikedDestination.findMany({
      where: { userId: userIdNum },
      include: { destination: { select: { category: true, region: true, city: true } } },
    })
    const categoryCounts: Record<string, number> = {}
    likedDestinations.forEach((ld) => {
      const cat = ld.destination.category ?? 'Uncategorized'
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
    })

    const regionCounts: Record<string, number> = {}
    const cities = new Set<string>()
    likedDestinations.forEach((ld) => {
      const reg = ld.destination.region ?? 'Unknown'
      regionCounts[reg] = (regionCounts[reg] || 0) + 1
      if (ld.destination.city) cities.add(ld.destination.city)
    })

    // Маршруты (города, км, бюджет)
    const routes = await prisma.route.findMany({
      where: { userId: userIdNum },
      select: { id: true, description: true },
    })
    routes.forEach((r) => {
      if (!r.description) return
      try {
        const p = JSON.parse(r.description) as { startPoint?: string; endPoint?: string }
        if (p.startPoint) cities.add(p.startPoint)
        if (p.endPoint) cities.add(p.endPoint)
      } catch {}
    })

    // Км из маршрутов
    let totalKm = 0
    routes.forEach((r) => {
      if (!r.description) return
      try {
        const p = JSON.parse(r.description) as { distance?: number }
        if (typeof p.distance === 'number') totalKm += p.distance
      } catch {}
    })

    // Потрачено (из TripBudget)
    let totalSpent = 0
    const routeIds = routes.map((r) => r.id)
    if (routeIds.length > 0) {
      try {
        const prismaWithTripBudget = prisma as unknown as {
          tripBudget: {
            findMany: (opts: { where: { routeId: { in: number[] } }; select: { transport: true; accommodation: true; food: true; entertainment: true } }) => Promise<Array<{ transport: unknown; accommodation: unknown; food: unknown; entertainment: unknown }>>
          }
        }
        const budgets = await prismaWithTripBudget.tripBudget.findMany({
          where: { routeId: { in: routeIds } },
          select: { transport: true, accommodation: true, food: true, entertainment: true },
        })
        budgets.forEach((b) => {
          totalSpent += Number(b.transport) + Number(b.accommodation) + Number(b.food) + Number(b.entertainment)
        })
      } catch {
        // TripBudget table may not exist yet
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        savedDestinations: savedDestinationsCount,
        routesCreated: routesCount,
        reviewsWritten: reviewsCount,
        averageRating: Math.round(avgRating * 10) / 10,
        favoriteCategory: Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a])[0] || null,
        favoriteRegion: Object.keys(regionCounts).sort((a, b) => regionCounts[b] - regionCounts[a])[0] || null,
        categoryBreakdown: categoryCounts,
        regionBreakdown: regionCounts,
        citiesVisited: cities.size,
        totalKm: Math.round(totalKm * 10) / 10,
        totalSpent: Math.round(totalSpent * 100) / 100,
      },
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
