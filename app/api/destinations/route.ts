import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET() {
  try {
    const { data, error } = await supabase.from('destinations').select('*')
    if (error) return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 })
    return NextResponse.json({ success: true, destinations: data })
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
