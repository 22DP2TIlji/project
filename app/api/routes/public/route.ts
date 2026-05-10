import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromId } from '@/lib/auth-utils'

// GET - публичные маршруты (топ по лайкам)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10', 10), 1), 50)
    const userId = searchParams.get('userId')
    let numericUserId: number | null = null
    if (userId && userId !== 'admin') {
      const user = await getUserFromId(userId)
      const parsedUserId = user?.id ? parseInt(user.id, 10) : NaN
      numericUserId = Number.isFinite(parsedUserId) ? parsedUserId : null
    }

    const routes = await prisma.route.findMany({
      where: { isPublic: true },
      include: {
        user: { select: { name: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit * 2, // берём больше, чтобы отсортировать по лайкам
    })

    const likedRouteIds = numericUserId
      ? new Set(
          (await prisma.routeLike.findMany({
            where: { userId: numericUserId, routeId: { in: routes.map((r) => r.id) } },
            select: { routeId: true },
          })).map((like) => like.routeId)
        )
      : new Set<number>()

    const withCounts = routes.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      userName: r.user.name,
      likesCount: r._count.likes,
      commentsCount: r._count.comments,
      likedByCurrentUser: likedRouteIds.has(r.id),
      createdAt: r.createdAt.toISOString(),
    }))

    // Сортируем по количеству лайков
    withCounts.sort((a, b) => b.likesCount - a.likesCount)
    const limited = withCounts.slice(0, limit)

    return NextResponse.json({ success: true, routes: limited })
  } catch (error) {
    console.error('Public routes error:', error)
    return NextResponse.json({ success: false, message: 'Servera kļūda' }, { status: 500 })
  }
}
