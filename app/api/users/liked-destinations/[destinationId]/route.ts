import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getUserFromId } from '@/lib/auth-utils';

// GET /api/users/liked-destinations - Get liked destinations for the current user
export async function GET(request: Request) {
  console.log('Received GET request for liked destinations');
  try {
    // Get user ID from request body (as per simplified auth setup)
    // Note: GET requests typically don't have a body, but we are using POST-like behavior for this simplified auth.
    // Consider revising auth for standard GET requests in production.
    const { userId } = await request.json(); // Assuming userId is passed in body for this simplified setup
    console.log('GET liked destinations for userId:', userId);

    const user = await getUserFromId(userId);
    if (!user) {
      console.log('GET liked destinations: User not authenticated or found');
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }
    console.log('User found for GET liked destinations:', user.id);

    console.log('Fetching liked destination IDs from Supabase...');
    const { data: likedRows, error: likedErr } = await supabase
      .from('user_liked_destinations')
      .select('destination_id')
      .eq('user_id', user.id);

    if (likedErr) {
      console.error('Supabase liked destinations error:', likedErr);
      return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 });
    }

    const ids = (likedRows ?? []).map((r: any) => r.destination_id);

    if (!ids.length) {
      return NextResponse.json({ success: true, likedDestinations: [] });
    }

    console.log('Fetching destination details from Supabase...');
    const { data: destinations, error: destErr } = await supabase
      .from('destinations')
      .select('*')
      .in('id', ids);

    if (destErr) {
      console.error('Supabase destinations select error:', destErr);
      return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true, likedDestinations: destinations ?? [] });
  } catch (error) {
    console.error('Error fetching liked destinations:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/users/liked-destinations - Add a liked destination for the current user
export async function POST(request: Request) {
  console.log('Received POST request to add liked destination');
  try {
    // Get user ID and destination ID from request body
    const { userId, destinationId } = await request.json();
    console.log('POST liked destination: userId =', userId, ', destinationId =', destinationId);

    const user = await getUserFromId(userId);
    if (!user) {
      console.log('POST liked destination: User not authenticated or found');
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }
     console.log('User found for POST liked destination:', user.id);

    if (!destinationId) {
       console.log('POST liked destination: Destination ID is missing');
      return NextResponse.json({ success: false, message: 'Destination ID is required' }, { status: 400 });
    }

    // Check if already liked (optional, database primary key also prevents duplicates)
    console.log('Checking if destination is already liked...');
    const [existing] = await pool.execute<RowDataPacket[]>( // Use RowDataPacket for SELECT
      'SELECT 1 FROM user_liked_destinations WHERE user_id = ? AND destination_id = ?',
      [user.id, destinationId]
    );
    console.log('Existing like check result:', existing);

    if (existing.length > 0) {
       console.log('Destination already liked');
       return NextResponse.json({ success: false, message: 'Destination already liked' }, { status: 409 });
    }

    console.log('Inserting liked destination into Supabase...');
    const { error: insertErr } = await supabase
      .from('user_liked_destinations')
      .insert([{ user_id: user.id, destination_id: destinationId }]);

    if (insertErr) {
      console.error('Supabase insert like error:', insertErr);
      return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 });
    }

    console.log('Successfully added liked destination');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding liked destination:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/users/liked-destinations/[destinationId] - Remove a liked destination for the current user
// Note: This uses a dynamic route segment for the destinationId, but we still need the user ID from the body.
export async function DELETE(request: Request, { params }: { params: { destinationId: string } }) {
   console.log('Received DELETE request to remove liked destination');
   try {
     // Get user ID from request body
     const { userId } = await request.json();
     console.log('DELETE liked destination: userId =', userId, ', destinationId from params =', params.destinationId);

     const user = await getUserFromId(userId);
     if (!user) {
        console.log('DELETE liked destination: User not authenticated or found');
       return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
     }
      console.log('User found for DELETE liked destination:', user.id);

     const { destinationId } = params;
     if (!destinationId) {
        console.log('DELETE liked destination: Destination ID is missing');
       return NextResponse.json({ success: false, message: 'Destination ID is required' }, { status: 400 });
     }

     console.log('Deleting liked destination from Supabase...');
     const { error: deleteErr } = await supabase
       .from('user_liked_destinations')
       .delete()
       .eq('user_id', user.id)
       .eq('destination_id', destinationId);

     if (deleteErr) {
       console.error('Supabase delete like error:', deleteErr);
       return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 });
     }
     console.log('Successfully removed liked destination');
     return NextResponse.json({ success: true });
   } catch (error) {
     console.error('Error removing liked destination:', error);
     return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
   }
} 