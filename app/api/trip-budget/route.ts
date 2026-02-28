import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromId } from '@/lib/auth-utils'

// GET - бюджет маршрута
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const routeId = searchParams.get('routeId')
    if (!routeId) {
      return NextResponse.json({ success: false, message: 'routeId required' }, { status: 400 })
    }

    const budget = await prisma.tripBudget.findUnique({
      where: { routeId: parseInt(routeId) },
    })
    if (!budget) {
      return NextResponse.json({ success: true, budget: null })
    }

    const transport = Number(budget.transport)
    const accommodation = Number(budget.accommodation)
    const food = Number(budget.food)
    const entertainment = Number(budget.entertainment)
    const total = transport + accommodation + food + entertainment

    return NextResponse.json({
      success: true,
      budget: {
        transport,
        accommodation,
        food,
        entertainment,
        total,
      },
    })
  } catch (error) {
    console.error('Trip budget error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

// POST - создать/обновить бюджет маршрута
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, routeId, transport = 0, accommodation = 0, food = 0, entertainment = 0 } = body as {
      userId?: string
      routeId?: number | string
      transport?: number
      accommodation?: number
      food?: number
      entertainment?: number
    }

    if (!userId || userId === 'admin') {
      return NextResponse.json({ success: false, message: 'User ID required' }, { status: 400 })
    }
    if (!routeId) {
      return NextResponse.json({ success: false, message: 'routeId required' }, { status: 400 })
    }

    const user = await getUserFromId(userId)
    if (!user || !user.id || user.id === 'admin') {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const rId = typeof routeId === 'string' ? parseInt(routeId) : routeId
    const route = await prisma.route.findFirst({
      where: { id: rId, userId: parseInt(user.id) },
    })
    if (!route) {
      return NextResponse.json({ success: false, message: 'Route not found' }, { status: 404 })
    }

    const t = Math.max(0, Number(transport) || 0)
    const a = Math.max(0, Number(accommodation) || 0)
    const f = Math.max(0, Number(food) || 0)
    const e = Math.max(0, Number(entertainment) || 0)

    const budget = await prisma.tripBudget.upsert({
      where: { routeId: rId },
      create: { routeId: rId, transport: t, accommodation: a, food: f, entertainment: e },
      update: { transport: t, accommodation: a, food: f, entertainment: e },
    })

    const total = t + a + f + e
    return NextResponse.json({
      success: true,
      budget: {
        transport: t,
        accommodation: a,
        food: f,
        entertainment: e,
        total,
      },
    })
  } catch (error) {
    console.error('Trip budget save error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
