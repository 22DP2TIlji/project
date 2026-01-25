import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { ObjectType } from "@prisma/client"

// ✅ единый фильтр для отзывов по destination
function getDestinationFilter(destinationId: number) {
  return {
    objectId: destinationId,
    objectType: ObjectType.destination, // ✅ enum, НЕ строка
  } as const
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const destinationId = Number(params.id)

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
    console.error("❌ GET reviews error:", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const destinationId = Number(params.id)

  if (!Number.isFinite(destinationId)) {
    return NextResponse.json({ success: false, message: "Invalid destination id" }, { status: 400 })
  }

  try {
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

    // userId в БД int
    const userId = userIdRaw === "admin" ? null : Number(userIdRaw)
    if (userIdRaw !== "admin" && !Number.isFinite(userId)) {
      return NextResponse.json({ success: false, message: "Invalid userId" }, { status: 400 })
    }

    // ⚠️ если ты НЕ хочешь разрешать admin оставлять отзывы — лучше запретить:
    // if (userIdRaw === "admin") {
    //   return NextResponse.json({ success: false, message: "Admin cannot leave reviews" }, { status: 403 })
    // }

    const created = await prisma.review.create({
      data: {
        ...getDestinationFilter(destinationId),
        userId: userId ?? 0,
        rating,
        comment,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ success: true, review: created })
  } catch (err) {
    console.error("❌ POST reviews error:", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
