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
    // Consider revising auth for standard GET requests in production.
    const { userId } = await request.json(); // Assuming userId is passed in body for this simplified setup
    console.log('GET liked destinations for userId:', userId);

    const user = await getUserFromId(userId);
    if (!user) {
      console.log('GET liked destinations: User not authenticated or found');
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }
    console.log('User found for GET liked destinations:', user.id);

    console.log('Executing SELECT JOIN query for liked destinations...');
    // Select full destination details for liked destinations
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT d.* FROM destinations d JOIN user_liked_destinations ul ON d.id = ul.destination_id WHERE ul.user_id = ?',
      [user.id]
    );
    console.log('SELECT JOIN query result (rows):', rows);

    // Return the full destination objects
    return NextResponse.json({ success: true, likedDestinations: rows });
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