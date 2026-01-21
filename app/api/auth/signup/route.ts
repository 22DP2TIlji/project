import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Missing email or password' }, { status: 400 })
    }

    // хешируем пароль
    const hashed = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name: name || '',
        email,
        password: hashed,
        role: 'user',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    return NextResponse.json({ 
      success: true, 
      user: {
        ...user,
        id: user.id.toString(),
      }
    })
  } catch (err: any) {
    console.error('Error in signup:', err)
    if (err.code === 'P2002') { // Prisma unique constraint violation
      return NextResponse.json({ success: false, message: 'Email already exists' }, { status: 409 })
    }
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
