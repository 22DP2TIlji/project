import { NextResponse } from 'next/server'
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ destinationId: string }> }
) {
  try {
    const { userId } = (await request.json()) as { userId?: string }
    if (!userId || userId === 'admin') {
      return NextResponse.json({ success: false, message: 'Trūkst lietotāja' }, { status: 400 })
    }

    const user = await getUserFromId(userId)
    if (!user?.id || user.id === 'admin') {
      return NextResponse.json({ success: false, message: 'Lietotājs nav atrasts' }, { status: 404 })
    }

    const destinationId = Number((await params).destinationId)
    if (!Number.isFinite(destinationId)) {
      return NextResponse.json({ success: false, message: 'Nederīgs galamērķa ID' }, { status: 400 })
    }

    await ensureVisitedTable()

    await prisma.$executeRawUnsafe(
      'DELETE FROM user_visited_destinations WHERE user_id = ? AND destination_id = ?',
      parseInt(user.id, 10),
      destinationId
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Visited destinations DELETE error:', error)
    return NextResponse.json({ success: false, message: 'Iekšējā servera kļūda' }, { status: 500 })
  }
}