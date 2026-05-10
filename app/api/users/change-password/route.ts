import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { getUserFromId } from '@/lib/auth-utils'

const PASSWORD_REQUIREMENTS = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

export async function POST(request: Request) {
  try {
    const { userId, currentPassword, newPassword } = (await request.json()) as {
      userId?: string
      currentPassword?: string
      newPassword?: string
    }

    if (!userId || userId === 'admin' || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Lūdzu, aizpildiet visus paroles maiņas laukus.' },
        { status: 400 }
      )
    }

    if (!PASSWORD_REQUIREMENTS.test(newPassword)) {
      return NextResponse.json(
        { success: false, message: 'Jaunajai parolei jābūt vismaz 8 rakstzīmes garai, ar vienu lielo burtu, vienu ciparu un vienu speciālo simbolu.' },
        { status: 400 }
      )
    }

    const authUser = await getUserFromId(userId)
    const numericUserId = authUser?.id ? parseInt(authUser.id, 10) : NaN
    if (!Number.isFinite(numericUserId)) {
      return NextResponse.json({ success: false, message: 'Lietotājs nav atrasts.' }, { status: 404 })
    }

    const user = await prisma.user.findUnique({ where: { id: numericUserId } })
    if (!user) {
      return NextResponse.json({ success: false, message: 'Lietotājs nav atrasts.' }, { status: 404 })
    }

    const currentPasswordMatches = await bcrypt.compare(currentPassword, user.password)
    if (!currentPasswordMatches) {
      return NextResponse.json({ success: false, message: 'Pašreizējā parole nav pareiza.' }, { status: 400 })
    }

    const samePassword = await bcrypt.compare(newPassword, user.password)
    if (samePassword) {
      return NextResponse.json({ success: false, message: 'Jaunajai parolei jāatšķiras no pašreizējās paroles.' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: numericUserId },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ success: true, message: 'Parole veiksmīgi nomainīta.' })
  } catch (error) {
    console.error('Kļūda, mainot paroli:', error)
    return NextResponse.json({ success: false, message: 'Servera kļūda.' }, { status: 500 })
  }
}
