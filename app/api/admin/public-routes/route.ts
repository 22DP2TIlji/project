import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const routes = await prisma.route.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } },
    })

    return NextResponse.json({
      success: true,
      routes: routes.map((route) => ({
        id: route.id,
        name: route.name,
        description: route.description,
        isPublic: route.isPublic,
        userName: route.user.name,
      })),
    })
  } catch (error) {
    console.error('GET /api/admin/public-routes error:', error)
    return NextResponse.json({ success: false, message: 'Neizdevās ielādēt publiskos maršrutus' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const routeId = Number(body?.routeId)
    const isPublic = Boolean(body?.isPublic)

    if (!Number.isFinite(routeId)) {
      return NextResponse.json({ success: false, message: 'Nederīgs maršruta ID' }, { status: 400 })
    }

    await prisma.route.update({
      where: { id: routeId },
      data: { isPublic },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PUT /api/admin/public-routes error:', error)
    return NextResponse.json({ success: false, message: 'Neizdevās atjaunināt maršruta statusu' }, { status: 500 })
  }
}