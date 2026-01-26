import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// API для получения рекомендаций похожих мест на основе сохраненных пользователем
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 })
    }

    // Получаем сохраненные направления пользователя
    const likedDestinations = await prisma.userLikedDestination.findMany({
      where: { userId: parseInt(userId) },
      include: { destination: true },
    })

    if (likedDestinations.length === 0) {
      // Если нет сохраненных, возвращаем популярные направления
      const popular = await prisma.destination.findMany({
        take: limit,
        orderBy: { id: 'desc' },
      })
      return NextResponse.json({ success: true, recommendations: popular })
    }

    // Получаем категории и регионы из сохраненных
    const categories = new Set<string>()
    const regions = new Set<string>()

    likedDestinations.forEach((ld) => {
      if (ld.destination.category) categories.add(ld.destination.category)
      if (ld.destination.region) regions.add(ld.destination.region)
    })

    const likedIds = likedDestinations.map((ld) => ld.destinationId)

    // Ищем похожие направления (та же категория или регион, но не сохраненные)
    const recommendations = await prisma.destination.findMany({
      where: {
        id: { notIn: likedIds },
        OR: [
          { category: { in: Array.from(categories) } },
          { region: { in: Array.from(regions) } },
        ],
      },
      take: limit,
      orderBy: { id: 'desc' },
    })

    // Если не хватает рекомендаций, добавляем случайные
    if (recommendations.length < limit) {
      const additional = await prisma.destination.findMany({
        where: {
          id: { notIn: [...likedIds, ...recommendations.map((r) => r.id)] },
        },
        take: limit - recommendations.length,
        orderBy: { id: 'desc' },
      })
      recommendations.push(...additional)
    }

    return NextResponse.json({ success: true, recommendations })
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
