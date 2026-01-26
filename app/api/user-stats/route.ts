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
      include: { destination: { select: { category: true } } },
    })
    const categoryCounts: Record<string, number> = {}
    likedDestinations.forEach((ld) => {
      const cat = ld.destination.category || 'Uncategorized'
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
    })

    // Регионы сохраненных направлений
    const regionCounts: Record<string, number> = {}
    likedDestinations.forEach((ld) => {
      const reg = ld.destination.region || 'Unknown'
      regionCounts[reg] = (regionCounts[reg] || 0) + 1
    })

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
      },
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
