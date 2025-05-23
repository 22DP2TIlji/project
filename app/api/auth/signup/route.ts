import { NextResponse } from 'next/server'
import pool from '../../../../lib/db'
import { RowDataPacket, OkPacket } from 'mysql2/promise'

export async function POST(
  request: Request
) {
  const { name, email, password } = await request.json()

  console.log('Signup attempt for email:', email);

  if (!name || !email || !password) {
    return NextResponse.json({ message: 'Name, email, and password are required' }, { status: 400 })
  }

  try {
    // Check if email already exists
    const [existingUsers] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    console.log('Database query result for existing email check:', existingUsers);

    if (existingUsers.length > 0) {
       console.log('Email already in use found in database:', email); // Log if email found
      return NextResponse.json({ success: false, message: 'Email already in use' }, { status: 409 })
    }

    // Create new user
    const [result] = await pool.execute<OkPacket>(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, 'user'] // Default role is 'user'
    )

    const insertId = result.insertId

    // Fetch the newly created user to return
    const [newUserRows] = await pool.execute<RowDataPacket[]>( 
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [insertId]
    )

    const newUser = newUserRows[0]

    return NextResponse.json({ success: true, user: newUser }, { status: 201 })

  } catch (error) {
    console.error('Database error during signup:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
} 