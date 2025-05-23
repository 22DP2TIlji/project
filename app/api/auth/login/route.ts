import { NextResponse } from 'next/server'
import pool from '../../../../lib/db'
import { RowDataPacket } from 'mysql2/promise'

export async function POST(
  request: Request
) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
  }

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name, email, role FROM users WHERE email = ? AND password = ?',
      [email, password]
    )

    if (rows.length > 0) {
      const user = rows[0]
      // In a real application, you would create a session or JWT here
      return NextResponse.json({ success: true, user: user }, { status: 200 })
    } else {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 })
    }
  } catch (error) {
    console.error('Database error during login:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
} 