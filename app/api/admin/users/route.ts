import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Get all users for admin panel
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
    })

    // Convert id to string for consistency
    const usersWithStringIds = users.map((user: { id: number; name: string; email: string; role: string; createdAt: Date }) => ({
      ...user,
      id: user.id.toString(),
      created_at: user.createdAt,
    }))

    return NextResponse.json({ success: true, users: usersWithStringIds })
  } catch (error) {
    console.error('GET /api/admin/users error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

// Update a user's role
export async function PUT(request: Request) {
  const { id, role } = await request.json()
  if (!id || !role) {
    return NextResponse.json({ success: false, message: 'User ID and role are required' }, { status: 400 })
  }

  // Cannot update admin user role
  if (id === 'admin') {
    return NextResponse.json({ success: false, message: 'Cannot modify admin user' }, { status: 403 })
  }

  try {
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role: role as 'user' | 'admin' },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating user role:', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
} 