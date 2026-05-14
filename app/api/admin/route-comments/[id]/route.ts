import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

function parseCommentId(id: string): number | null {
  const parsed = Number(id)
  return Number.isFinite(parsed) ? parsed : null
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const commentId = parseCommentId(params.id)
  if (commentId == null) {
    return NextResponse.json({ success: false, message: 'Nederīgs komentāra ID' }, { status: 400 })
  }

  let body: { text?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, message: 'Nederīgs JSON formāts' }, { status: 400 })
  }

  const text = typeof body.text === 'string' ? body.text.trim() : ''
  if (!text) {
    return NextResponse.json({ success: false, message: 'Komentārs nedrīkst būt tukšs' }, { status: 400 })
  }

  try {
    const existing = await prisma.routeComment.findFirst({
      where: { id: commentId, route: { isPublic: true } },
      select: { id: true },
    })
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Publiskā maršruta komentārs nav atrasts' }, { status: 404 })
    }

    const updated = await prisma.routeComment.update({
      where: { id: commentId },
      data: { text: text.slice(0, 2000) },
      include: {
        route: { select: { id: true, name: true, isPublic: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({
      success: true,
      comment: {
        id: updated.id,
        routeId: updated.routeId,
        routeName: updated.route.name,
        isPublicRoute: updated.route.isPublic,
        userId: updated.userId,
        userName: updated.user.name,
        userEmail: updated.user.email,
        text: updated.text,
        createdAt: updated.createdAt.toISOString(),
      },
    })
  } catch (error: unknown) {
    console.error('PUT /api/admin/route-comments/[id] error:', error)
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2025') {
      return NextResponse.json({ success: false, message: 'Komentārs nav atrasts' }, { status: 404 })
    }
    return NextResponse.json({ success: false, message: 'Neizdevās atjaunināt komentāru' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const commentId = parseCommentId(params.id)
  if (commentId == null) {
    return NextResponse.json({ success: false, message: 'Nederīgs komentāra ID' }, { status: 400 })
  }

  try {
    const existing = await prisma.routeComment.findFirst({
      where: { id: commentId, route: { isPublic: true } },
      select: { id: true },
    })
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Publiskā maršruta komentārs nav atrasts' }, { status: 404 })
    }

    await prisma.routeComment.delete({ where: { id: commentId } })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('DELETE /api/admin/route-comments/[id] error:', error)
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2025') {
      return NextResponse.json({ success: false, message: 'Komentārs nav atrasts' }, { status: 404 })
    }
    return NextResponse.json({ success: false, message: 'Neizdevās dzēst komentāru' }, { status: 500 })
  }
}