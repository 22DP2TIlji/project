import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket } from 'mysql2/promise'

export async function GET(request: Request) {
  try {
    // Parse query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search');
    const category = searchParams.get('category');
    const region = searchParams.get('region');

    let query = 'SELECT * FROM destinations';
    const queryParams: (string | number)[] = [];
    const conditions: string[] = [];

    // Add search condition if searchTerm is provided
    if (searchTerm) {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      queryParams.push(`%${searchTerm}%`);
      queryParams.push(`%${searchTerm}%`);
    }

    // Add category condition if category is provided and not 'all'
    if (category && category !== 'all') {
      conditions.push('category = ?');
      queryParams.push(category);
    }

    // Add region condition if region is provided and not 'all'
    if (region && region !== 'all') {
      conditions.push('region = ?');
      queryParams.push(region);
    }

    // Combine conditions with AND
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    console.log('Executing query:', query);
    console.log('With parameters:', queryParams);

    // Execute the query with parameters
    const [rows] = await pool.execute<RowDataPacket[]>(query, queryParams);

    console.log('Query results:', rows);

    return NextResponse.json({ success: true, destinations: rows });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}