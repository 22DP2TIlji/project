import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { userId } = (await request.json()) as { userId?: string | number }

    if (!userId || userId === "admin") {
      return NextResponse.json({ success: false, message: "Invalid user" }, { status: 400 })
    }

    const id = Number(userId)
    if (!Number.isFinite(id)) {
      return NextResponse.json({ success: false, message: "Invalid user" }, { status: 400 })
    }

    await prisma.user.update({
      where: { id },
      data: { updatedAt: new Date() },
      select: { id: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("POST /api/users/presence error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
