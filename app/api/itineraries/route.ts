import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { getUserFromId } from "@/lib/auth-utils"

type ItineraryPayload = {
  id?: string
  startPoint?: string
  endPoint?: string
  distance?: number
  time?: number
  date?: string
  // любые дополнительные поля маршрута
  [key: string]: any
}

// GET /api/itineraries?userId=123 - получить сохранённые маршруты конкретного пользователя
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 })
    }

    // Для админа пока не храним персональные маршруты
    if (userId === "admin") {
      return NextResponse.json({ success: true, itineraries: [] })
    }

    const user = await getUserFromId(userId)
    if (!user || !user.id || user.id === "admin") {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    const numericUserId = parseInt(user.id)
    if (isNaN(numericUserId)) {
      return NextResponse.json({ success: false, message: "Invalid user ID" }, { status: 400 })
    }

    const routes = await prisma.route.findMany({
      where: { userId: numericUserId },
      orderBy: { createdAt: "desc" },
    })

    const itineraries: ItineraryPayload[] = routes.map((route) => {
      let parsed: ItineraryPayload = {} as ItineraryPayload
      if (route.description) {
        try {
          parsed = JSON.parse(route.description) as ItineraryPayload
        } catch {
          // если не получилось распарсить, просто игнорируем
        }
      }

      return {
        id: route.id.toString(),
        startPoint: parsed.startPoint ?? route.name,
        endPoint: parsed.endPoint ?? "",
        distance: parsed.distance ?? 0,
        time: parsed.time ?? 0,
        date: parsed.date ?? route.createdAt.toISOString(),
        ...parsed,
      }
    })

    return NextResponse.json({ success: true, itineraries })
  } catch (error) {
    console.error("Error fetching itineraries:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

// POST /api/itineraries - сохранить маршрут за конкретным пользователем
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, itinerary } = body as {
      userId?: string
      itinerary?: ItineraryPayload
    }

    if (!userId || !itinerary) {
      return NextResponse.json({ success: false, message: "User ID and itinerary are required" }, { status: 400 })
    }

    if (userId === "admin") {
      return NextResponse.json(
        { success: false, message: "Admin user cannot save itineraries" },
        { status: 403 }
      )
    }

    const user = await getUserFromId(userId)
    if (!user || !user.id || user.id === "admin") {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    const numericUserId = parseInt(user.id)
    if (isNaN(numericUserId)) {
      return NextResponse.json({ success: false, message: "Invalid user ID" }, { status: 400 })
    }

    const name =
      itinerary.startPoint && itinerary.endPoint
        ? `${itinerary.startPoint} → ${itinerary.endPoint}`
        : "Saved route"

    const description = JSON.stringify(itinerary)
    const isPublic = !!itinerary.isPublic

    const startCoords = itinerary.startCoords as [number, number] | undefined
    const endCoords = itinerary.endCoords as [number, number] | undefined
    const startLat = startCoords?.[0] ?? 0
    const startLng = startCoords?.[1] ?? 0
    const endLat = endCoords?.[0] ?? 0
    const endLng = endCoords?.[1] ?? 0

    const created = await prisma.route.create({
      data: {
        userId: numericUserId,
        name,
        description,
        startLat,
        startLng,
        endLat,
        endLng,
        isPublic,
      } as Prisma.RouteUncheckedCreateInput,
    })

    return NextResponse.json({ success: true, routeId: created.id })
  } catch (error) {
    console.error("Error saving itinerary:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/itineraries - удалить маршрут пользователя
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, routeId } = body as { userId?: string; routeId?: string | number }

    if (!userId || routeId === undefined || routeId === null) {
      return NextResponse.json(
        { success: false, message: "User ID and route ID are required" },
        { status: 400 }
      )
    }

    if (userId === "admin") {
      return NextResponse.json(
        { success: false, message: "Admin user cannot delete itineraries" },
        { status: 403 }
      )
    }

    const user = await getUserFromId(userId)
    if (!user || !user.id || user.id === "admin") {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    const numericUserId = parseInt(user.id)
    const numericRouteId =
      typeof routeId === "string" ? parseInt(routeId, 10) : Number(routeId)

    if (isNaN(numericUserId) || isNaN(numericRouteId)) {
      return NextResponse.json({ success: false, message: "Invalid IDs" }, { status: 400 })
    }

    await prisma.route.deleteMany({
      where: {
        id: numericRouteId,
        userId: numericUserId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting itinerary:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

