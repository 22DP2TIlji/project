import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - публичные маршруты (топ по лайкам)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10', 10), 1), 50)

    const routes = await prisma.route.findMany({
      where: { isPublic: true },
      include: {
        user: { select: { name: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit * 2, // берём больше, чтобы отсортировать по лайкам
    })

    const withCounts = routes.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      userName: r.user.name,
      likesCount: r._count.likes,
      commentsCount: r._count.comments,
      createdAt: r.createdAt.toISOString(),
    }))

    // Сортируем по количеству лайков
    withCounts.sort((a, b) => b.likesCount - a.likesCount)
    const limited = withCounts.slice(0, limit)

    return NextResponse.json({ success: true, routes: limited })
  } catch (error) {
    console.error('Public routes error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
