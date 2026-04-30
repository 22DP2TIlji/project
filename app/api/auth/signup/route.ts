import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Trūkst e-pasta vai paroles' },
        { status: 400 }
      )
    }

    // šifrējam paroli
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
      },
    })
  } catch (err: any) {
    console.error('Kļūda reģistrācijas laikā:', err)

    // Prisma unikālā ierobežojuma pārkāpums
    if (err.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'E-pasts jau eksistē' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Iekšēja servera kļūda' },
      { status: 500 }
    )
  }
}