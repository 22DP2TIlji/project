import { NextResponse } from 'next/server'
import pool from '../../../../lib/db'
import { RowDataPacket } from 'mysql2/promise'

export async function GET() {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name, email, role FROM users'
    )
    return NextResponse.json({ success: true, users: rows })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
} 