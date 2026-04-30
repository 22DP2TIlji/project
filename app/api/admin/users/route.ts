import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface UserData {
  id: number
  name: string
  email: string
  role: string
  createdAt: Date
}

// Iegūst visus lietotājus administratora panelim
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }) as UserData[]

    // Pārveidojam ID par tekstu, lai saglabātu vienotu formātu
    const usersWithStringIds = users.map((user: UserData) => ({
      ...user,
      id: user.id.toString(),
      created_at: user.createdAt,
    }))

    const totalRoutes = await prisma.route.count()

    return NextResponse.json({ success: true, users: usersWithStringIds, totalRoutes })
  } catch (error) {
    console.error('GET /api/admin/users kļūda:', error)

    return NextResponse.json(
      { success: false, message: 'Iekšēja servera kļūda' },
      { status: 500 }
    )
  }
}

// Atjaunina lietotāja lomu
export async function PUT(request: Request) {
  const { id, role } = await request.json()

  if (!id || !role) {
    return NextResponse.json(
      { success: false, message: 'Nepieciešams lietotāja ID un loma' },
      { status: 400 }
    )
  }

  // Administratora lietotāja lomu nedrīkst mainīt
  if (id === 'admin') {
    return NextResponse.json(
      { success: false, message: 'Administratora lietotāju nedrīkst mainīt' },
      { status: 403 }
    )
  }

  try {
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role: role as 'user' | 'admin' },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Kļūda, atjauninot lietotāja lomu:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, message: 'Lietotājs nav atrasts' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Iekšēja servera kļūda' },
      { status: 500 }
    )
  }
}