import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromId } from '@/lib/auth-utils'

// GET /api/users/liked-destinations?userId=123
export async function GET(request: NextRequest) {
  try {
    const userId = new URL(request.url).searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Nepieciešams lietotāja ID' },
        { status: 400 }
      )
    }

    const user = await getUserFromId(userId)

    if (!user) {
      console.log('GET patīkamie galamērķi: lietotājs nav autorizēts vai nav atrasts')

      return NextResponse.json(
        { success: false, message: 'Lietotājs nav autorizēts' },
        { status: 401 }
      )
    }

    console.log('Lietotājs atrasts GET patīkamajiem galamērķiem:', user.id)

    // Apstrādājam administratora lietotāju — administratoram nav patīkamo galamērķu
    if (user.id === 'admin') {
      return NextResponse.json({ success: true, likedDestinations: [] })
    }

    console.log('Iegūstam patīkamo galamērķu ID...')

    const likedRows = await prisma.userLikedDestination.findMany({
      where: { userId: parseInt(user.id) },
      select: { destinationId: true },
    })

    const ids = likedRows.map((r) => r.destinationId)

    if (!ids.length) {
      return NextResponse.json({ success: true, likedDestinations: [] })
    }

    console.log('Iegūstam galamērķu informāciju...')

    const destinations = await prisma.destination.findMany({
      where: { id: { in: ids } },
    })

    return NextResponse.json({ success: true, likedDestinations: destinations ?? [] })
  } catch (error) {
    console.error('Kļūda, iegūstot patīkamos galamērķus:', error)

    return NextResponse.json(
      { success: false, message: 'Iekšēja servera kļūda' },
      { status: 500 }
    )
  }
}

// POST /api/users/liked-destinations - pievieno pašreizējam lietotājam patīkamo galamērķi
export async function POST(request: Request) {
  console.log('Saņemts POST pieprasījums patīkamā galamērķa pievienošanai')

  try {
    // Iegūstam lietotāja ID un galamērķa ID no pieprasījuma satura
    const { userId, destinationId } = await request.json()

    console.log('POST patīkamais galamērķis: userId =', userId, ', destinationId =', destinationId)

    const user = await getUserFromId(userId)

    if (!user) {
      console.log('POST patīkamais galamērķis: lietotājs nav autorizēts vai nav atrasts')

      return NextResponse.json(
        { success: false, message: 'Lietotājs nav autorizēts' },
        { status: 401 }
      )
    }

    console.log('Lietotājs atrasts POST patīkamajam galamērķim:', user.id)

    if (destinationId === undefined || destinationId === null) {
      return NextResponse.json(
        { success: false, message: 'Nepieciešams galamērķa ID' },
        { status: 400 }
      )
    }

    const destIdNum =
      typeof destinationId === 'number' ? destinationId : parseInt(String(destinationId), 10)

    if (!Number.isFinite(destIdNum)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Galamērķa ID jābūt skaitlim. Saglabājiet vietas no galamērķu saraksta.',
        },
        { status: 400 }
      )
    }

    // Apstrādājam administratora lietotāju — administrators nevar atzīmēt galamērķus kā patīkamus
    if (user.id === 'admin') {
      return NextResponse.json(
        { success: false, message: 'Administrators nevar atzīmēt galamērķus kā patīkamus' },
        { status: 403 }
      )
    }

    // Pārbaudām, vai galamērķis jau ir atzīmēts kā patīkams
    console.log('Pārbaudām, vai galamērķis jau ir atzīmēts kā patīkams...')

    const existing = await prisma.userLikedDestination.findUnique({
      where: {
        userId_destinationId: {
          userId: parseInt(user.id),
          destinationId: destIdNum,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Galamērķis jau ir atzīmēts kā patīkams' },
        { status: 409 }
      )
    }

    await prisma.userLikedDestination.create({
      data: {
        userId: parseInt(user.id),
        destinationId: destIdNum,
      },
    })

    console.log('Patīkamais galamērķis veiksmīgi pievienots')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Kļūda, pievienojot patīkamo galamērķi:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'Galamērķis jau ir atzīmēts kā patīkams' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Iekšēja servera kļūda' },
      { status: 500 }
    )
  }
}