import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { ObjectType } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const destinationIdParam = request.nextUrl.searchParams.get("destinationId")
    const destinationId = destinationIdParam ? Number(destinationIdParam) : undefined

    const where =
      destinationId != null && Number.isFinite(destinationId)
        ? { objectId: destinationId, objectType: ObjectType.attraction }
        : { objectType: ObjectType.attraction }

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { id: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })

    const destinationIds = Array.from(new Set(reviews.map((r) => r.objectId)))
    const destinations = await prisma.destination.findMany({
      where: { id: { in: destinationIds } },
      select: { id: true, name: true },
    })
    const destMap = Object.fromEntries(destinations.map((d) => [d.id, d.name]))

    const list = reviews.map((r) => ({
      id: r.id,
      userId: r.userId,
      userName: r.user.name,
      userEmail: r.user.email,
      objectId: r.objectId,
      destinationName: destMap[r.objectId] ?? `#${r.objectId}`,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    }))

    return NextResponse.json({ success: true, reviews: list })
  } catch (err) {
    console.error("GET /api/admin/reviews error:", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
