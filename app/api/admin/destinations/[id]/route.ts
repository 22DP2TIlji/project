import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { ObjectType } from "@prisma/client"

type RouteParams = {
  params: {
    id: string
  }
}

function getDestinationFilter(destinationId: number) {
  return {
    objectId: destinationId,
    objectType: ObjectType.attraction,
  } as const
}

export async function GET(_: Request, { params }: RouteParams) {
  const destinationId = Number(params.id)

  if (!Number.isFinite(destinationId)) {
    return NextResponse.json(
      { success: false, message: "Invalid destination id" },
      { status: 400 },
    )
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
  } catch (error) {
    console.error("GET /reviews error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  const destinationId = Number(params.id)

  if (!Number.isFinite(destinationId)) {
    return NextResponse.json(
      { success: false, message: "Invalid destination id" },
      { status: 400 },
    )
  }

  try {
    const { userId, rating, comment } = (await request.json()) as {
      userId?: string
      rating?: number | string
      comment?: string
    }

    const trimmedComment = typeof comment === "string" ? comment.trim() : ""
    const numericRating = Number(rating)

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      )
    }

    // Не даём админ-аккаунту оставлять отзывы
    if (userId === "admin") {
      return NextResponse.json(
        { success: false, message: "Admin cannot leave reviews" },
        { status: 403 },
      )
    }

    if (!trimmedComment) {
      return NextResponse.json(
        { success: false, message: "Comment is required" },
        { status: 400 },
      )
    }

    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be between 1 and 5" },
        { status: 400 },
      )
    }

    const numericUserId = Number(userId)
    if (!Number.isFinite(numericUserId)) {
      return NextResponse.json(
        { success: false, message: "Invalid user id" },
        { status: 400 },
      )
    }

    const created = await prisma.review.create({
      data: {
        ...getDestinationFilter(destinationId),
        userId: numericUserId,
        rating: numericRating,
        comment: trimmedComment,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ success: true, review: created })
  } catch (error: unknown) {
    console.error("POST /reviews error:", error)
    const message =
      error && typeof error === "object" && "message" in error
        ? String((error as { message: unknown }).message)
        : "Internal server error"
    return NextResponse.json(
      { success: false, message },
      { status: 500 },
    )
  }
}
