import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { ObjectType } from "@prisma/client"

// ✅ единый фильтр для отзывов по destination
function getDestinationFilter(destinationId: number) {
  return {
    objectId: destinationId,
    objectType: ObjectType.attraction, // ✅ enum, НЕ строка
  } as const
}

function getIdFromRequest(request: Request): string | null {
  try {
    const url = new URL(request.url)
    const parts = url.pathname.split("/").filter(Boolean)
    const idx = parts.indexOf("destinations")
    if (idx !== -1 && parts[idx + 1] && parts[idx + 2] === "reviews") {
      return parts[idx + 1]
    }
  } catch {
    // ignore
  }
  return null
}

export async function GET(request: Request, context: { params?: { id?: string } | Promise<{ id?: string }> }) {
  const resolved: { id?: string } =
    context.params != null && typeof (context.params as Promise<unknown>).then === "function"
      ? await (context.params as Promise<{ id?: string }>)
      : (context.params ?? {}) as { id?: string }
  const idRaw = resolved.id ?? getIdFromRequest(request)
  if (idRaw == null || idRaw === "") {
    return NextResponse.json({ success: false, message: "Invalid destination id" }, { status: 400 })
  }
  const destinationId = Number(idRaw)
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

export async function POST(request: Request, context: { params?: { id?: string } | Promise<{ id?: string }> }) {
  const resolved: { id?: string } =
    context.params != null && typeof (context.params as Promise<unknown>).then === "function"
      ? await (context.params as Promise<{ id?: string }>)
      : (context.params ?? {}) as { id?: string }
  const idRaw = resolved.id ?? getIdFromRequest(request)
  if (idRaw == null || idRaw === "") {
    return NextResponse.json({ success: false, message: "Invalid destination id" }, { status: 400 })
  }
  const destinationId = Number(idRaw)

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
    console.error("POST reviews error:", err)
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : "Internal server error"
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
