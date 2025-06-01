import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, OkPacket } from 'mysql2/promise';
import { getUserFromId } from '@/lib/auth-utils';

// GET /api/users/liked-destinations - Get liked destinations for the current user
export async function GET(request: Request) {
  console.log('Received GET request for liked destinations');
  try {
    // Get user ID from request body (as per simplified auth setup)
    // Note: GET requests typically don't have a body, but we are using POST-like behavior for this simplified auth.
    const { userId } = await request.json();
    console.log('GET liked destinations for userId:', userId);

    const user = await getUserFromId(userId);
    if (!user) {
      console.log('GET liked destinations: User not authenticated or found');
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }
    console.log('User found for GET liked destinations:', user.id);

    console.log('Executing SELECT query for liked destinations...');
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT destination_id FROM user_liked_destinations WHERE user_id = ?',
      [user.id]
    );
    console.log('SELECT query result (rows):', rows);

    const likedDestinations = rows.map(row => row.destination_id);
    console.log('Returning liked destinations:', likedDestinations);
    return NextResponse.json({ success: true, likedDestinations });
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

    console.log('Executing INSERT query to add liked destination...');
    const [result] = await pool.execute<OkPacket>( // Use OkPacket for INSERT/DELETE/UPDATE
      'INSERT INTO user_liked_destinations (user_id, destination_id) VALUES (?, ?)',
      [user.id, destinationId] // Assuming user.id and destinationId match the table types (INT and INT)
    );
     console.log('INSERT query result:', result);

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

     console.log('Executing DELETE query to remove liked destination...');
     const [result] = await pool.execute<OkPacket>(
       'DELETE FROM user_liked_destinations WHERE user_id = ? AND destination_id = ?',
       [user.id, destinationId] // Assuming user.id and destinationId match the table types (INT and INT)
     );
     console.log('DELETE query result:', result);

     if (result.affectedRows === 0) {
        console.log('Liked destination not found for removal');
        return NextResponse.json({ success: false, message: 'Liked destination not found for this user' }, { status: 404 });
     }

     console.log('Successfully removed liked destination');
     return NextResponse.json({ success: true });
   } catch (error) {
     console.error('Error removing liked destination:', error);
     return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
   }
} 