import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const routeId = Number(params.id)
  if (!Number.isFinite(routeId)) {
    return NextResponse.json({ success: false, message: 'Nederīgs maršruta ID' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    if (!name) {
      return NextResponse.json({ success: false, message: 'Maršruta nosaukums nedrīkst būt tukšs' }, { status: 400 })
    }

    await prisma.route.update({
      where: { id: routeId },
      data: { name: name.slice(0, 100) },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PUT /api/admin/public-routes/[id] error:', error)
    return NextResponse.json({ success: false, message: 'Neizdevās atjaunināt maršrutu' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const routeId = Number(params.id)
  if (!Number.isFinite(routeId)) {
    return NextResponse.json({ success: false, message: 'Nederīgs maršruta ID' }, { status: 400 })
  }

  try {
    await prisma.route.delete({ where: { id: routeId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/public-routes/[id] error:', error)
    return NextResponse.json({ success: false, message: 'Neizdevās dzēst maršrutu' }, { status: 500 })
  }
}
