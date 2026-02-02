import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { ObjectType } from "@prisma/client"

function getDestinationFilter(destinationId: number) {
  return {
    objectId: destinationId,
    objectType: ObjectType.attraction,
  } as const
}

export async function GET(request: NextRequest) {
  const destinationId = Number(request.nextUrl.searchParams.get("destinationId"))
  if (!Number.isFinite(destinationId)) {
    return NextResponse.json({ success: false, message: "Invalid destination id" }, { status: 400 })
  }

  try {
    const reviews = await prisma.review.findMany({
      where: getDestinationFilter(destinationId),
      orderBy: { id: "desc" },
      include: {
        user: { select: { id: true, name: true } },
      },
    })
    return NextResponse.json({ success: true, reviews })
  } catch (err) {
    console.error("GET /api/reviews error:", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 })
  }

  const b = body as Record<string, unknown>
  const destinationId = Number(b?.destinationId)
  const userIdRaw = b?.userId
  const comment = typeof b?.comment === "string" ? b.comment.trim() : ""
  const rating = Number(b?.rating)

  if (!Number.isFinite(destinationId)) {
    return NextResponse.json({ success: false, message: "Invalid destination id" }, { status: 400 })
  }
  if (!userIdRaw) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
  }
  if (userIdRaw === "admin") {
    return NextResponse.json({ success: false, message: "Admin cannot leave reviews" }, { status: 403 })
  }
  if (!comment) {
    return NextResponse.json({ success: false, message: "Comment is required" }, { status: 400 })
  }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ success: false, message: "Rating must be 1..5" }, { status: 400 })
  }

  const numericUserId = Number(userIdRaw)
  if (!Number.isFinite(numericUserId)) {
    return NextResponse.json({ success: false, message: "Invalid user id" }, { status: 400 })
  }

  try {
    const created = await prisma.review.create({
      data: {
        ...getDestinationFilter(destinationId),
        userId: numericUserId,
        rating,
        comment,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    })
    return NextResponse.json({ success: true, review: created })
  } catch (err: unknown) {
    console.error("POST /api/reviews error:", err)
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : "Internal server error"
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
