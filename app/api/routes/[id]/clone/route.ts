import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromId } from '@/lib/auth-utils'

// POST - клонировать публичный маршрут в аккаунт пользователя
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const originalRouteId = parseInt((await params).id)
    const body = await request.json()
    const { userId } = body as { userId?: string }

    if (!userId || userId === 'admin') {
      return NextResponse.json({ success: false, message: 'User ID required' }, { status: 400 })
    }

    const user = await getUserFromId(userId)
    if (!user || !user.id || user.id === 'admin') {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const numericUserId = parseInt(user.id)
    if (isNaN(numericUserId)) {
      return NextResponse.json({ success: false, message: 'Invalid user ID' }, { status: 400 })
    }

    const original = await prisma.route.findUnique({
      where: { id: originalRouteId },
    })
    if (!original) {
      return NextResponse.json({ success: false, message: 'Route not found' }, { status: 404 })
    }
    if (!original.isPublic) {
      return NextResponse.json({ success: false, message: 'Route is not public' }, { status: 403 })
    }

    const cloned = await prisma.route.create({
      data: {
        userId: numericUserId,
        name: original.name + ' (copy)',
        description: original.description,
        startLat: original.startLat,
        startLng: original.startLng,
        endLat: original.endLat,
        endLng: original.endLng,
        isPublic: false,
      },
    })

    return NextResponse.json({
      success: true,
      routeId: cloned.id,
      message: 'Route cloned successfully',
    })
  } catch (error) {
    console.error('Clone route error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
