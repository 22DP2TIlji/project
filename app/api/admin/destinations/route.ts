import { NextResponse } from 'next/server'
import pool from '../../../../lib/db'
import { OkPacket } from 'mysql2/promise'

export async function POST(request: Request) {
  const { name, description } = await request.json()
  if (!name || !description) {
    return NextResponse.json({ success: false, message: 'Name and description required' }, { status: 400 })
  }
  try {
    const [result] = await pool.execute<OkPacket>(
      'INSERT INTO destinations (name, description) VALUES (?, ?)',
      [name, description]
    )
    return NextResponse.json({ success: true, id: result.insertId })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
} 