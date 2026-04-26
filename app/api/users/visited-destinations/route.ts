import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromId } from '@/lib/auth-utils'

async function ensureVisitedTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS user_visited_destinations (
      user_id INT NOT NULL,
      destination_id INT NOT NULL,
      visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, destination_id)
    )
  `)
}

export async function GET(request: NextRequest) {
  try {
    const userId = new URL(request.url).searchParams.get('userId')
    if (!userId || userId === 'admin') {
      return NextResponse.json({ success: true, visitedDestinations: [] })
    }

    const user = await getUserFromId(userId)
    if (!user?.id || user.id === 'admin') {
      return NextResponse.json({ success: false, message: 'Lietotājs nav atrasts' }, { status: 404 })
    }

    await ensureVisitedTable()

    const rows = await prisma.$queryRawUnsafe<Array<{ destination_id: number }>>(
      'SELECT destination_id FROM user_visited_destinations WHERE user_id = ?',
      parseInt(user.id, 10)
    )

    const ids = rows.map((r) => r.destination_id)
    if (!ids.length) {
      return NextResponse.json({ success: true, visitedDestinations: [] })
    }

    const visitedDestinations = await prisma.destination.findMany({
      where: { id: { in: ids } },
    })

    return NextResponse.json({ success: true, visitedDestinations })
  } catch (error) {
    console.error('Visited destinations GET error:', error)
    return NextResponse.json({ success: false, message: 'Iekšējā servera kļūda' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, destinationId } = body as { userId?: string; destinationId?: number | string }

    if (!userId || userId === 'admin' || destinationId == null) {
      return NextResponse.json({ success: false, message: 'Trūkst datu' }, { status: 400 })
    }

    const user = await getUserFromId(userId)
    if (!user?.id || user.id === 'admin') {
      return NextResponse.json({ success: false, message: 'Lietotājs nav atrasts' }, { status: 404 })
    }

    const numericDestinationId = Number(destinationId)
    if (!Number.isFinite(numericDestinationId)) {
      return NextResponse.json({ success: false, message: 'Nederīgs galamērķis' }, { status: 400 })
    }

    await ensureVisitedTable()

    await prisma.$executeRawUnsafe(
      'INSERT IGNORE INTO user_visited_destinations (user_id, destination_id) VALUES (?, ?)',
      parseInt(user.id, 10),
      numericDestinationId
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Visited destinations POST error:', error)
    return NextResponse.json({ success: false, message: 'Iekšējā servera kļūda' }, { status: 500 })
  }
}