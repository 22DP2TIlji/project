import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Trūkst e-pasta vai paroles' },
        { status: 400 }
      )
    }

    // Speciāls iepriekš definēts administratora konts
    if (email === 'admin@gmail.com' && password === 'adminpassword') {
      return NextResponse.json({
        success: true,
        user: {
          id: 'admin',
          name: 'Administrators',
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
      return NextResponse.json(
        { success: false, message: 'Lietotājs nav atrasts' },
        { status: 404 }
      )
    }

    const valid = await bcrypt.compare(password, user.password)

    if (!valid) {
      return NextResponse.json(
        { success: false, message: 'Nepareizi piekļuves dati' },
        { status: 401 }
      )
    }

    const likedRows = await prisma.userLikedDestination.findMany({
      where: { userId: user.id },
      select: { destinationId: true },
    })
    const savedDestinations = likedRows.map((r) => r.destinationId)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        savedDestinations,
        savedItineraries: [],
      },
    })
  } catch (err) {
    console.error('Kļūda autorizācijas laikā:', err)

    return NextResponse.json(
      { success: false, message: 'Iekšēja servera kļūda' },
      { status: 500 }
    )
  }
}