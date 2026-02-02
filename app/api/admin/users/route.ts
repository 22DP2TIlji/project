import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

interface UserData {
  id: number
  name: string
  email: string
  role: string
  createdAt: Date
}

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
    }) as UserData[]

    // Convert id to string for consistency
    const usersWithStringIds = users.map((user: UserData) => ({
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

// Create a new user (admin only)
export async function POST(request: Request) {
  try {
    const { name, email, password } = (await request.json()) as { name?: string; email?: string; password?: string }
    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ success: false, message: 'Name, email and password are required' }, { status: 400 })
    }
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedName = name.trim()
    if (password.length < 6) {
      return NextResponse.json({ success: false, message: 'Password must be at least 6 characters' }, { status: 400 })
    }
    const hashed = await bcrypt.hash(password, 10)
    const created = await prisma.user.create({
      data: {
        name: trimmedName,
        email: trimmedEmail,
        password: hashed,
        role: 'user',
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })
    return NextResponse.json({
      success: true,
      user: {
        ...created,
        id: created.id.toString(),
      },
    })
  } catch (err: unknown) {
    const code = err && typeof err === 'object' && 'code' in err ? (err as { code: string }).code : null
    if (code === 'P2002') {
      return NextResponse.json({ success: false, message: 'Email already exists' }, { status: 409 })
    }
    console.error('POST /api/admin/users error:', err)
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