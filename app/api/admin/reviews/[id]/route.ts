import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

function parseId(id: string): number | null {
  const n = Number(id)
  return Number.isFinite(n) ? n : null
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const reviewId = parseId(params.id)
  if (reviewId == null) {
    return NextResponse.json({ success: false, message: "Invalid review id" }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 })
  }

  const b = body as Record<string, unknown>
  const rating = typeof b?.rating === "number" ? b.rating : Number(b?.rating)
  const comment = typeof b?.comment === "string" ? b.comment.trim() : b?.comment == null ? null : String(b.comment)

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ success: false, message: "Rating must be 1..5" }, { status: 400 })
  }

  try {
    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: { rating, comment: comment ?? undefined },
      include: {
        user: { select: { id: true, name: true } },
      },
    })
    return NextResponse.json({ success: true, review: updated })
  } catch (err: unknown) {
    console.error("PUT /api/admin/reviews/[id] error:", err)
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2025") {
      return NextResponse.json({ success: false, message: "Review not found" }, { status: 404 })
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const reviewId = parseId(params.id)
  if (reviewId == null) {
    return NextResponse.json({ success: false, message: "Invalid review id" }, { status: 400 })
  }

  try {
    await prisma.review.delete({
      where: { id: reviewId },
    })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error("DELETE /api/admin/reviews/[id] error:", err)
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2025") {
      return NextResponse.json({ success: false, message: "Review not found" }, { status: 404 })
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
