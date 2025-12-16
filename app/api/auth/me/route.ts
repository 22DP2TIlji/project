import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { getUserFromId } from '@/lib/auth-utils'

export async function POST(request: Request) {
  try {
    const { id: userId } = await request.json()

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

    // Fetch the user's liked destinations from Supabase
    const { data: likedRows, error } = await supabase
      .from('user_liked_destinations')
      .select('destination_id')
      .eq('user_id', user.id)

    if (error) {
      console.error('Supabase liked destinations error:', error)
      return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 })
    }

    const likedDestinations = (likedRows ?? []).map((row: any) => row.destination_id)

    // Add liked destinations to the user object
    const userWithLiked = { ...user, savedDestinations: likedDestinations }

    return NextResponse.json({ success: true, user: userWithLiked })
  } catch (error) {
    console.error('Error fetching user data:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
} 