import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromId } from '@/lib/auth-utils'

// GET - список комментариев к маршруту
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const routeId = parseInt((await params).id)
    const route = await prisma.route.findUnique({ where: { id: routeId } })
    if (!route) {
      return NextResponse.json({ success: false, message: 'Route not found' }, { status: 404 })
    }

    const comments = await prisma.routeComment.findMany({
      where: { routeId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })

    const items = comments.map((c) => ({
      id: c.id,
      userId: c.userId,
      userName: c.user.name,
      text: c.text,
      createdAt: c.createdAt.toISOString(),
    }))

    return NextResponse.json({ success: true, comments: items })
  } catch (error) {
    console.error('Route comments error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

// POST - добавить комментарий
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const routeId = parseInt((await params).id)
    const body = await request.json()
    const { userId, text } = body as { userId?: string; text?: string }

    if (!userId || userId === 'admin') {
      return NextResponse.json({ success: false, message: 'User ID required' }, { status: 400 })
    }
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ success: false, message: 'Comment text required' }, { status: 400 })
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

    const comment = await prisma.routeComment.create({
      data: { userId: numericUserId, routeId, text: text.trim().slice(0, 2000) },
      include: { user: { select: { name: true } } },
    })

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        userId: comment.userId,
        userName: comment.user.name,
        text: comment.text,
        createdAt: comment.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Route comment error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
