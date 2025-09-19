import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search');
    const category = searchParams.get('category');
    const region = searchParams.get('region');

    let query = supabase.from('destinations').select('*');

    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (region && region !== 'all') {
      query = query.eq('region', region);
    }

    const { data: destinations, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ success: false, message: 'Supabase query error' }, { status: 500 });
    }

    return NextResponse.json({ success: true, destinations });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}