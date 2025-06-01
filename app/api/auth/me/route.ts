import { NextResponse } from 'next/server'
import pool from '../../../../lib/db'
import { RowDataPacket } from 'mysql2/promise'
import { getUserFromId } from '@/lib/auth-utils'

export async function POST(request: Request) {
  try {
    const { id: userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 })
    }

    const user = await getUserFromId(userId)

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    // Fetch the user's liked destinations
    const [likedRows] = await pool.execute<RowDataPacket[]>(
      'SELECT destination_id FROM user_liked_destinations WHERE user_id = ?',
      [user.id]
    )
    const likedDestinations = likedRows.map(row => row.destination_id)

    // Add liked destinations to the user object
    const userWithLiked = { ...user, savedDestinations: likedDestinations }

    return NextResponse.json({ success: true, user: userWithLiked })
  } catch (error) {
    console.error('Error fetching user data:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
} 