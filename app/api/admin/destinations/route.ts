import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

// Create destination (no params on this root route)
export async function POST(request: Request) {
  const body = await request.json()
  const { name, description, category, region, imageUrl } = body

  if (!name || !description) {
    return NextResponse.json({ success: false, message: 'Name and description are required' }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from('destinations')
      .insert([
        {
          name,
          description,
          category: category || null,
          region: region || null,
          image_url: imageUrl || null,
        },
      ])
      .select('id')
      .single()

    if (error || !data) {
      console.error('Supabase insert destination error:', error)
      return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (err) {
    console.error('Error in POST destination:', err)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
