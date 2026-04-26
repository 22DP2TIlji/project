import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromId } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const userId = new URL(request.url).searchParams.get('userId')
    if (!userId || userId === 'admin') {
      return NextResponse.json({ success: true, routes: [] })
    }

    const user = await getUserFromId(userId)
    if (!user?.id || user.id === 'admin') {
      return NextResponse.json({ success: false, message: 'Lietotājs nav atrasts' }, { status: 404 })
    }

    const numericUserId = parseInt(user.id, 10)
    const likes = await (prisma as unknown as {
      routeLike: { findMany: (args: object) => Promise<Array<{ routeId: number }>> }
    }).routeLike.findMany({
      where: { userId: numericUserId },
      select: { routeId: true },
    })

    const routeIds = likes.map((l) => l.routeId)
    if (!routeIds.length) {
      return NextResponse.json({ success: true, routes: [] })
    }

    const routes = await prisma.route.findMany({
      where: { id: { in: routeIds } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      routes: routes.map((r) => ({ id: r.id, name: r.name, createdAt: r.createdAt.toISOString() })),
    })
  } catch (error) {
    console.error('Liked routes GET error:', error)
    return NextResponse.json({ success: false, message: 'Iekšējā servera kļūda' }, { status: 500 })
  }
}