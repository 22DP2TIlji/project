import { NextResponse } from 'next/server'
import pool from '../../../../lib/db'
import { RowDataPacket } from 'mysql2/promise'

export async function POST(request: Request) {
  const { id } = await request.json()
  if (!id) {
    return NextResponse.json({ success: false, message: 'No session id' }, { status: 400 })
  }
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [id]
    )
    if (rows.length > 0) {
      return NextResponse.json({ success: true, user: rows[0] })
    } else {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
} 