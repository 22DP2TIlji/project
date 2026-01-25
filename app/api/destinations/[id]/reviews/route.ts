import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const destinationId = Number(params.id)
  if (!Number.isFinite(destinationId)) {
    return NextResponse.json({ success: false, message: "Invalid destination id" }, { status: 400 })
  }

  const reviews = await prisma.review.findMany({
    where: { destinationId },
    orderBy: { id: "desc" },
    include: {
      user: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json({ success: true, reviews })
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const destinationId = Number(params.id)
  if (!Number.isFinite(destinationId)) {
    return NextResponse.json({ success: false, message: "Invalid destination id" }, { status: 400 })
  }

  const body = await request.json()
  const userIdRaw = body?.userId
  const comment = typeof body?.comment === "string" ? body.comment.trim() : ""
  const rating = Number(body?.rating)

  if (!userIdRaw) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
  }
  if (!comment) {
    return NextResponse.json({ success: false, message: "Comment is required" }, { status: 400 })
  }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ success: false, message: "Rating must be 1..5" }, { status: 400 })
  }

  // если userId в БД int:
  const userId = userIdRaw === "admin" ? null : Number(userIdRaw)
  if (userIdRaw !== "admin" && !Number.isFinite(userId)) {
    return NextResponse.json({ success: false, message: "Invalid userId" }, { status: 400 })
  }

  const created = await prisma.review.create({
    data: {
      destinationId,
      userId: userId ?? 0, // если админа не хранишь — лучше запретить, чем писать 0
      rating,
      comment,
    },
    include: {
      user: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json({ success: true, review: created })
}
