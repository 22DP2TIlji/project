import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';
import { NextResponse } from 'next/server';

// This utility provides functions to interact with user session/authentication on the backend.

// In a real app, this function would read session info (e.g., cookie, JWT)
// from the incoming request headers/cookies and validate it on the server.
// For this example, we'll use a simplified approach assuming user ID is passed.

// Helper function to get user based on ID passed in the request body/params
export async function getUserFromId(userId: string | number): Promise<any | null> {
  if (!userId) {
    console.error('getUserFromId called with null or undefined userId');
    return null;
  }
  try {
    // Assuming user IDs are numbers based on your users table structure (check if VARCHAR is used)
    // If using UUIDs or strings, adjust the type and query.
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [userId]
    );
    if (rows.length > 0) {
      return rows[0];
    }
    console.warn('User not found for ID:', userId);
    return null;
  } catch (error) {
    console.error('Database error fetching user by ID:', error);
    return null;
  }
}

// We might add more authentication-related server-side utilities here later. 