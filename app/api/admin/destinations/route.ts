import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Create destination (no params on this root route)
export async function POST(request: Request) {
  const body = await request.json()
  const { name, description, category, region, imageUrl } = body

  if (!name || !description) {
    return NextResponse.json({ success: false, message: 'Name and description are required' }, { status: 400 })
  }

  try {
    const destination = await prisma.destination.create({
      data: {
        name,
        description,
        category: category || null,
        region: region || null,
      },
      select: {
        id: true,
      },
    })

    return NextResponse.json({ success: true, id: destination.id })
  } catch (err) {
    console.error('Error in POST destination:', err)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
