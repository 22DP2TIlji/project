import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { normalizeDestinationImageUrl } from '../destination-images'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const description = typeof body?.description === 'string' ? body.description.trim() : ''
    const category = typeof body?.category === 'string' ? body.category.trim() || null : null
    const region = typeof body?.region === 'string' ? body.region.trim() || null : null
    const imageUrl = normalizeDestinationImageUrl(body?.imageUrl)

    if (!name || !description) {
      return NextResponse.json(
        { success: false, message: 'Nepieciešams nosaukums un apraksts' },
        { status: 400 },
      )
    }

    const destination = await prisma.destination.create({
      data: {
        name,
        description,
        category,
        region,
        imageUrl,
      },
      select: { id: true, imageUrl: true },
    })

    return NextResponse.json({
      success: true,
      id: destination.id,
      imageUrl: destination.imageUrl,
    })
  } catch (err) {
    console.error('Kļūda POST /api/admin/destinations:', err)

    return NextResponse.json(
      {
        success: false,
        message: 'Iekšēja servera kļūda',
        error: String(err),
      },
      { status: 500 },
    )
  }
}