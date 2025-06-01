import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { OkPacket } from 'mysql2/promise'

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    await pool.execute<OkPacket>('DELETE FROM destinations WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const { name, description } = await request.json()
  try {
    await pool.execute<OkPacket>(
      'UPDATE destinations SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  const { name, description } = await request.json()
  console.log('Attempting to add destination:', { name, description });
  if (!name || !description) {
    console.error('Validation failed: Name and description required');
    return NextResponse.json({ success: false, message: 'Name and description required' }, { status: 400 })
  }
  try {
    console.log('Executing database insert...');
    const [result] = await pool.execute<OkPacket>(
      'INSERT INTO destinations (name, description) VALUES (?, ?)',
      [name, description]
    )
    console.log('Database insert successful:', result);
    return NextResponse.json({ success: true, id: result.insertId })
  } catch (error) {
    console.error('Database error during destination insert:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}