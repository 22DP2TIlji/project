export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const comments = await prisma.routeComment.findMany({
      where: { route: { isPublic: true } },
      orderBy: { createdAt: 'desc' },
      include: {
        route: { select: { id: true, name: true, isPublic: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({
      success: true,
      comments: comments.map((comment: any) => ({
        id: comment.id,
        routeId: comment.routeId,
        routeName: comment.route.name,
        isPublicRoute: comment.route.isPublic,
        userId: comment.userId,
        userName: comment.user.name,
        userEmail: comment.user.email,
        text: comment.text,
        createdAt: comment.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('GET /api/admin/route-comments error:', error)
    return NextResponse.json(
      { success: false, message: 'Neizdevās ielādēt maršrutu komentārus' },
      { status: 500 }
    )
  }
}