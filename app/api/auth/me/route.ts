import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromId } from '@/lib/auth-utils'

interface LikedDestinationRow {
  destinationId: number
}

export async function POST(request: Request) {
  try {
    const { id: userId } = await request.json() as { id: string | undefined }

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 })
    }

    // Special-case hard-coded admin account
    if (userId === 'admin') {
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

    const user = await getUserFromId(userId)

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    // Fetch the user's liked destinations (skip for admin)
    let likedDestinations: number[] = []
    if (userId !== 'admin' && typeof userId === 'string') {
      const likedRows = await prisma.userLikedDestination.findMany({
        where: { userId: parseInt(userId) },
        select: { destinationId: true },
      }) as LikedDestinationRow[]
      likedDestinations = likedRows.map((row: LikedDestinationRow) => row.destinationId)
    }

    // Add liked destinations to the user object
    const userWithLiked = { ...user, savedDestinations: likedDestinations }

    return NextResponse.json({ success: true, user: userWithLiked })
  } catch (error) {
    console.error('Error fetching user data:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
} 