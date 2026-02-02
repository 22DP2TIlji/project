import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

function parseId(id: string): number | null {
  const n = Number(id)
  return Number.isFinite(n) ? n : null
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const userId = parseId(params.id)
  if (userId == null) {
    return NextResponse.json({ success: false, message: 'Invalid user id' }, { status: 400 })
  }

  try {
    const routes = await prisma.route.findMany({ where: { userId }, select: { id: true } })
    const routeIds = routes.map((r) => r.id)

    await prisma.$transaction([
      prisma.routePoint.deleteMany({ where: { routeId: { in: routeIds } } }),
      prisma.route.deleteMany({ where: { userId } }),
      prisma.review.deleteMany({ where: { userId } }),
      prisma.userLikedDestination.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ])

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('DELETE /api/admin/users/[id] error:', err)
    const code = err && typeof err === 'object' && 'code' in err ? (err as { code: string }).code : null
    if (code === 'P2025') {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
