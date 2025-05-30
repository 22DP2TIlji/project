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