import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

// Get all users for admin panel
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')

    if (error) {
      console.error('Supabase users select error:', error)
      return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ success: true, users: data ?? [] })
  } catch (error) {
    console.error('GET /api/admin/users error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

// Update a user's role
export async function PUT(request: Request) {
  const { id, role } = await request.json()
  if (!id || !role) {
    return NextResponse.json({ success: false, message: 'User ID and role are required' }, { status: 400 })
  }

  try {
    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', id)

    if (error) {
      console.error('Supabase update role error:', error)
      return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
} 