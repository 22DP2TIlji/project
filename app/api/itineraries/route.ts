// app/api/itineraries/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const userIdRaw = body?.id ?? body?.userId; // поддержим оба формата
    const route = body?.route ?? body;          // поддержим оба формата

    if (!userIdRaw) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 });
    }

    // admin — не пишем в БД
    if (userIdRaw === "admin") {
      return NextResponse.json({ success: true, itinerary: null, message: "Admin itinerary not stored" });
    }

    const userId = Number.parseInt(String(userIdRaw), 10);
    if (Number.isNaN(userId)) {
      return NextResponse.json({ success: false, message: "Invalid userId" }, { status: 400 });
    }

    const { startPoint, endPoint, startCoords, endCoords, distance, time, timeMinutes } = route ?? {};

    if (!startPoint || !endPoint || !startCoords || !endCoords) {
      return NextResponse.json(
        { success: false, message: "Missing route data (startPoint/endPoint/startCoords/endCoords)" },
        { status: 400 }
      );
    }

    const created = await prisma.savedItinerary.create({
      data: {
        userId,
        startPoint,
        endPoint,
        startLat: startCoords[0],
        startLng: startCoords[1],
        endLat: endCoords[0],
        endLng: endCoords[1],
        distanceKm: distance ?? null,
        timeMin: timeMinutes ?? (time != null ? Math.round(time * 60) : null),
      },
    });

    return NextResponse.json({ success: true, itinerary: created });
  } catch (error) {
    console.error("Error saving itinerary:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userIdRaw = url.searchParams.get("id");

    if (!userIdRaw) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 });
    }

    if (userIdRaw === "admin") {
      return NextResponse.json({ success: true, itineraries: [] });
    }

    const userId = Number.parseInt(String(userIdRaw), 10);
    if (Number.isNaN(userId)) {
      return NextResponse.json({ success: false, message: "Invalid userId" }, { status: 400 });
    }

    const itineraries = await prisma.savedItinerary.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, itineraries });
  } catch (error) {
    console.error("Error loading itineraries:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
