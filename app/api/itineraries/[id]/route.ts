// app/api/itineraries/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getUserFromId } from "@/lib/auth-utils"

// GET - получить маршрут для детального просмотра (публичные или свои)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const routeId = parseInt((await params).id)
    if (!Number.isFinite(routeId)) {
      return NextResponse.json({ success: false, message: "Invalid route id" }, { status: 400 })
    }

    const routeRow = await prisma.route.findUnique({
      where: { id: routeId },
    })

    if (!routeRow) {
      return NextResponse.json({ success: false, message: "Route not found" }, { status: 404 })
    }

    const isPublic = (routeRow as { isPublic?: boolean }).isPublic === true
    if (!isPublic) {
      return NextResponse.json({ success: false, message: "Route is not public" }, { status: 403 })
    }

    let parsed: Record<string, unknown> = {}
    if (routeRow.description) {
      try {
        parsed = JSON.parse(routeRow.description) as Record<string, unknown>
      } catch {
        // ignore
      }
    }

    const row = routeRow as { startLat?: unknown; startLng?: unknown; endLat?: unknown; endLng?: unknown }
    const startCoords =
      (parsed.startCoords as [number, number]) ??
      (row.startLat != null && row.startLng != null
        ? [Number(row.startLat), Number(row.startLng)]
        : undefined)
    const endCoords =
      (parsed.endCoords as [number, number]) ??
      (row.endLat != null && row.endLng != null
        ? [Number(row.endLat), Number(row.endLng)]
        : undefined)
const {
      id: _ignoredParsedId,
      date: parsedDate,
      startPoint: parsedStartPoint,
      endPoint: parsedEndPoint,
      startCoords: parsedStartCoords,
      endCoords: parsedEndCoords,
      distance: parsedDistance,
      time: parsedTime,
      ...parsedRest
    } = parsed
    const itinerary = {
      id: routeRow.id.toString(),
      startPoint: (parsedStartPoint as string) ?? routeRow.name,
      endPoint: (parsedEndPoint as string) ?? "",
      startCoords: (parsedStartCoords as [number, number]) ?? startCoords,
      endCoords: (parsedEndCoords as [number, number]) ?? endCoords,
      distance: (parsedDistance as number) ?? 0,
      time: (parsedTime as number) ?? 0,
      date: (parsedDate as string) ?? routeRow.createdAt.toISOString(),
      isPublic: true,
      ...parsedRest,
    }

    return NextResponse.json({ success: true, itinerary })
  } catch (error) {
    console.error("GET /api/itineraries/[id] error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const routeId = parseInt((await params).id)
    if (!Number.isFinite(routeId)) {
      return NextResponse.json({ success: false, message: "Invalid route id" }, { status: 400 })
    }

    const body = (await req.json().catch(() => ({}))) as { userId?: string; isPublic?: boolean }
    const { userId, isPublic } = body

    if (!userId || userId === "admin") {
      return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 })
    }

    const user = await getUserFromId(userId)
    if (!user || !user.id || user.id === "admin") {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    const numericUserId = parseInt(user.id)
    if (!Number.isFinite(numericUserId)) {
      return NextResponse.json({ success: false, message: "Invalid user id" }, { status: 400 })
    }

    const existing = await prisma.route.findUnique({
      where: { id: routeId },
      select: { userId: true },
    })

    if (!existing) {
      return NextResponse.json({ success: false, message: "Route not found" }, { status: 404 })
    }
    if (existing.userId !== numericUserId) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    await prisma.route.update({
      where: { id: routeId },
      data: { isPublic: !!isPublic },
    })
    return NextResponse.json({ success: true, isPublic: !!isPublic })
  } catch (error) {
    console.error("PATCH /api/itineraries/[id] error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

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
