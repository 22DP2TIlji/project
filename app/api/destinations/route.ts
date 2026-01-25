import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const destinations = await prisma.destination.findMany({
      orderBy: { id: "desc" },
      include: {
        images: { select: { id: true, url: true } }, // ✅ ключевое
      },
    });

    return NextResponse.json({ success: true, destinations });
  } catch (err) {
    console.error("❌ GET /api/destinations:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}


