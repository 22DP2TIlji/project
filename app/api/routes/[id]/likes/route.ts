import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromId } from '@/lib/auth-utils'

// GET - количество лайков и статус текущего пользователя
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const routeId = parseInt((await params).id)
    const userId = request.nextUrl.searchParams.get('userId')
    const ext = prisma as unknown as { routeLike: { count: (args: object) => Promise<number>; findUnique: (args: object) => Promise<unknown>; delete: (args: object) => Promise<unknown>; create: (args: object) => Promise<unknown> } }

    const count = await ext.routeLike.count({ where: { routeId } })
    let liked = false
    if (userId && userId !== 'admin') {
      const user = await getUserFromId(userId)
      if (user && user.id && user.id !== 'admin') {
        const numericUserId = parseInt(user.id)
        if (!isNaN(numericUserId)) {
          const like = await ext.routeLike.findUnique({
            where: { userId_routeId: { userId: numericUserId, routeId } },
          })
          liked = !!like
        }
      }
    }

    return NextResponse.json({ success: true, count, liked })
  } catch (error) {
    console.error('Route likes error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

// POST - лайк/анлайк
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const routeId = parseInt((await params).id)
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

    const route = await prisma.route.findUnique({ where: { id: routeId } })
    if (!route) {
      return NextResponse.json({ success: false, message: 'Route not found' }, { status: 404 })
    }
    const ext = prisma as unknown as { routeLike: { count: (args: object) => Promise<number>; findUnique: (args: object) => Promise<unknown>; delete: (args: object) => Promise<unknown>; create: (args: object) => Promise<unknown> } }

    const existing = await ext.routeLike.findUnique({
      where: { userId_routeId: { userId: numericUserId, routeId } },
    })

    if (existing) {
      await ext.routeLike.delete({
        where: { userId_routeId: { userId: numericUserId, routeId } },
      })
      const count = await ext.routeLike.count({ where: { routeId } })
      return NextResponse.json({ success: true, liked: false, count })
    } else {
      await ext.routeLike.create({
        data: { userId: numericUserId, routeId },
      })
      const count = await ext.routeLike.count({ where: { routeId } })
      return NextResponse.json({ success: true, liked: true, count })
    }
  } catch (error) {
    console.error('Route like error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
