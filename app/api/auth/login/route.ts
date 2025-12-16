import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Missing email or password' }, { status: 400 })
    }

    // Special hard-coded admin account
    if (email === 'admin@gmail.com' && password === 'adminpassword') {
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

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1)

    if (error) {
      console.error('Supabase select error:', error)
      return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 })
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const user = users[0]
    const valid = await bcrypt.compare(password, user.password)

    if (!valid) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        savedDestinations: user.savedDestinations ?? [],
        savedItineraries: user.savedItineraries ?? [],
      },
    })
  } catch (err) {
    console.error('Error in login:', err)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
