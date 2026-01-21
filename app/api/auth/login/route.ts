import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Missing email or password' }, { status: 400 })
    }

    // Special hard-coded admin account
    if (email === 'admin@gmail.com' && password === 'adminpassword') {
      return NextResponse.json({
        success: true,
        user: {
          id: 'admin',
          name: 'Admin',
          email: 'admin@gmail.com',
          role: 'admin',
          savedDestinations: [],
          savedItineraries: [],
        },
      })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const valid = await bcrypt.compare(password, user.password)

    if (!valid) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        savedDestinations: [],
        savedItineraries: [],
      },
    })
  } catch (err) {
    console.error('Error in login:', err)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
