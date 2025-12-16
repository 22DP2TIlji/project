import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

// Update a single destination by id
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const body = await request.json()
  const { name, description, category, region, imageUrl } = body

  try {
    const { error } = await supabase
      .from('destinations')
      .update({
        name,
        description,
        category,
        region,
        image_url: imageUrl ?? null,
      })
      .eq('id', id)

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error in PUT destination:', err)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

// Delete a single destination by id
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    const { error } = await supabase.from('destinations').delete().eq('id', id)

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error in DELETE destination:', err)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
