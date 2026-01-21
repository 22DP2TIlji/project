import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const destinations = await prisma.destination.findMany()
    return NextResponse.json({ success: true, destinations })
  } catch (error) {
    console.error('Error fetching destinations:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
