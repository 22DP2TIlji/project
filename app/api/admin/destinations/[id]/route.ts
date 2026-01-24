import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Update a single destination by id
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const body = await request.json()
  const { name, description, category, region, imageUrl } = body

  try {
    await prisma.destination.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        category,
        region
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error in PUT destination:', err)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

// Delete a single destination by id
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    await prisma.destination.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error in DELETE destination:', err)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
