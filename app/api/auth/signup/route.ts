import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Missing email or password' }, { status: 400 })
    }

    // хешируем пароль
    const hashed = await bcrypt.hash(password, 10)

    const { error } = await supabase
      .from('users')
      .insert([{ name, email, password: hashed, role: 'user' }])

    if (error) {
      if (error.code === '23505') { // unique violation
        return NextResponse.json({ success: false, message: 'Email already exists' }, { status: 409 })
      }
      console.error('Supabase insert error:', error)
      return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error in signup:', err)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
