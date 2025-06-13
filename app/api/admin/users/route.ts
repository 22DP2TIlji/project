import { NextResponse } from 'next/server'
import pool from '../../../../lib/db'
import { RowDataPacket, OkPacket } from 'mysql2/promise'

export async function GET() {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name, email, role, created_at FROM users'
    )
    return NextResponse.json({ success: true, users: rows })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const { id, role } = await request.json()
  if (!id || !role) {
    return NextResponse.json({ success: false, message: 'User ID and role are required' }, { status: 400 })
  }

  try {
    await pool.execute<OkPacket>(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, id]
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
} 