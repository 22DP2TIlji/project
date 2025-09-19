import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function POST(
  request: Request
) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
  }

  try {
    // Fetch user data
    const [userRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name, email, role FROM users WHERE email = ? AND password = ?',
      [email, password]
    )

    if (userRows.length > 0) {
      const user = userRows[0]

      // Fetch the user's liked destinations
      const [likedRows] = await pool.execute<RowDataPacket[]>(
        'SELECT destination_id FROM user_liked_destinations WHERE user_id = ?',
        [user.id]
      )
      const likedDestinations = likedRows.map(row => row.destination_id)

      // Add liked destinations to the user object
      const userWithLiked = { ...user, savedDestinations: likedDestinations }

      // In a real application, you would create a session or JWT here
      return NextResponse.json({ success: true, user: userWithLiked }, { status: 200 })
    } else {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 })
    }
  } catch (error) {
    console.error('Database error during login:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
} 