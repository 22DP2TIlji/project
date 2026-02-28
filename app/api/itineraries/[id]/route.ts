// app/api/itineraries/[id]/route.ts
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const itineraryId = Number((await params).id)
    if (!Number.isFinite(itineraryId)) {
      return NextResponse.json({ success: false, message: "Invalid itinerary id" }, { status: 400 })
    }

    const body = (await req.json().catch(() => ({}))) as { id?: string }
    const userId = body?.id

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 })
    }

    if (userId === "admin") {
      await prisma.route.deleteMany({ where: { id: itineraryId } })
      return NextResponse.json({ success: true })
    }

    const uid = Number(userId)
    if (!Number.isFinite(uid)) {
      return NextResponse.json({ success: false, message: "Invalid user id" }, { status: 400 })
    }

    const existing = await prisma.route.findUnique({
      where: { id: itineraryId },
      select: { id: true, userId: true },
    })

    if (!existing) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 })
    }

    if (existing.userId !== uid) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    await prisma.route.delete({ where: { id: itineraryId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/itineraries/[id] error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
