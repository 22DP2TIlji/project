import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromId } from "@/lib/auth-utils";
import { createRouteName, serializeItineraryForRouteDescription } from "@/lib/route-storage";

type ItineraryPayload = {
  id?: string;
  startPoint?: string;
  endPoint?: string;
  distance?: number;
  time?: number;
  date?: string;
  tripName?: string;
  isPublic?: boolean;
  startCoords?: [number, number];
  endCoords?: [number, number];
  [key: string]: any;
};

function parseRouteDescription(description: string | null): ItineraryPayload {
  if (!description) return {};

  try {
    return JSON.parse(description) as ItineraryPayload;
  } catch {
    return {};
  }
}

function serializeRoute(route: {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
  isPublic?: boolean;
}) {
  const parsed = parseRouteDescription(route.description);
  const {
    id: _ignoredParsedId,
    date: parsedDate,
    startPoint: parsedStartPoint,
    endPoint: parsedEndPoint,
    distance: parsedDistance,
    time: parsedTime,
    ...parsedRest
  } = parsed;

  return {
    id: route.id.toString(),
    startPoint: parsedStartPoint ?? route.name,
    endPoint: parsedEndPoint ?? "",
    distance: parsedDistance ?? 0,
    time: parsedTime ?? 0,
    date: parsedDate ?? route.createdAt.toISOString(),
    ...parsedRest,
    isPublic: route.isPublic ?? false,
  };
}

// GET /api/itineraries?userId=123 - iegūt saglabātos lietotāja maršrutus
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Nepieciešams lietotāja ID" },
        { status: 400 },
      );
    }

    if (userId === "admin") {
      return NextResponse.json({ success: true, itineraries: [] });
    }

    const user = await getUserFromId(userId);
    if (!user?.id || user.id === "admin") {
      return NextResponse.json(
        { success: false, message: "Lietotājs nav atrasts" },
        { status: 404 },
      );
    }

    const numericUserId = parseInt(user.id, 10);
    if (!Number.isFinite(numericUserId)) {
      return NextResponse.json(
        { success: false, message: "Nederīgs lietotāja ID" },
        { status: 400 },
      );
    }

    const routes = await prisma.route.findMany({
      where: { userId: numericUserId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      itineraries: routes.map((route) =>
        serializeRoute({
          id: route.id,
          name: route.name,
          description: route.description,
          createdAt: route.createdAt,
          isPublic: (route as { isPublic?: boolean }).isPublic,
        }),
      ),
    });
  } catch (error) {
    console.error("Error fetching itineraries:", error);
    return NextResponse.json(
      { success: false, message: "Servera kļūda" },
      { status: 500 },
    );
  }
}

// POST /api/itineraries - saglabāt maršrutu lietotājam
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, itinerary } = body as {
      userId?: string;
      itinerary?: ItineraryPayload;
    };

    if (!userId || !itinerary) {
      return NextResponse.json(
        { success: false, message: "Nepieciešams lietotāja ID un maršruts" },
        { status: 400 },
      );
    }

    if (userId === "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Administrators nevar saglabāt personīgos maršrutus",
        },
        { status: 403 },
      );
    }

    const user = await getUserFromId(userId);
    if (!user?.id || user.id === "admin") {
      return NextResponse.json(
        { success: false, message: "Lietotājs nav atrasts" },
        { status: 404 },
      );
    }

    const numericUserId = parseInt(user.id, 10);
    if (!Number.isFinite(numericUserId)) {
      return NextResponse.json(
        { success: false, message: "Nederīgs lietotāja ID" },
        { status: 400 },
      );
    }

    const name = createRouteName(
      itinerary.tripName
        ? String(itinerary.tripName)
        : itinerary.startPoint && itinerary.endPoint
          ? `${itinerary.startPoint} → ${itinerary.endPoint}`
          : "Saglabāts maršruts",
    );

    const startCoords = itinerary.startCoords;
    const endCoords = itinerary.endCoords;

    const created = await prisma.route.create({
      data: {
        userId: numericUserId,
        name,
        description: serializeItineraryForRouteDescription(itinerary),
        startLat: startCoords?.[0] ?? 0,
        startLng: startCoords?.[1] ?? 0,
        endLat: endCoords?.[0] ?? 0,
        endLng: endCoords?.[1] ?? 0,
        isPublic: !!itinerary.isPublic,
      } as any,
    });

    return NextResponse.json({ success: true, routeId: created.id });
  } catch (error) {
    console.error("Error saving itinerary:", error);
    return NextResponse.json(
      { success: false, message: "Servera kļūda" },
      { status: 500 },
    );
  }
}

// DELETE /api/itineraries - dzēst lietotāja maršrutu
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, routeId } = body as {
      userId?: string;
      routeId?: string | number;
    };

    if (!userId || routeId === undefined || routeId === null) {
      return NextResponse.json(
        { success: false, message: "Nepieciešams lietotāja ID un maršruta ID" },
        { status: 400 },
      );
    }

    if (userId === "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Administrators nevar dzēst personīgos maršrutus",
        },
        { status: 403 },
      );
    }

    const user = await getUserFromId(userId);
    if (!user?.id || user.id === "admin") {
      return NextResponse.json(
        { success: false, message: "Lietotājs nav atrasts" },
        { status: 404 },
      );
    }

    const numericUserId = parseInt(user.id, 10);
    const numericRouteId =
      typeof routeId === "string" ? parseInt(routeId, 10) : Number(routeId);

    if (!Number.isFinite(numericUserId) || !Number.isFinite(numericRouteId)) {
      return NextResponse.json(
        { success: false, message: "Nederīgi identifikatori" },
        { status: 400 },
      );
    }

    const existing = await prisma.route.findUnique({
      where: { id: numericRouteId },
      select: { id: true, userId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Maršruts nav atrasts" },
        { status: 404 },
      );
    }

    if (existing.userId !== numericUserId) {
      return NextResponse.json(
        { success: false, message: "Piekļuve liegta" },
        { status: 403 },
      );
    }

    const db = prisma as any;
    await db.routeComment?.deleteMany?.({ where: { routeId: numericRouteId } });
    await db.routeLike?.deleteMany?.({ where: { routeId: numericRouteId } });
    await db.tripBudget?.deleteMany?.({ where: { routeId: numericRouteId } });
    await prisma.routePoint.deleteMany({ where: { routeId: numericRouteId } });
    await prisma.route.delete({ where: { id: numericRouteId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting itinerary:", error);
    return NextResponse.json(
      { success: false, message: "Servera kļūda" },
      { status: 500 },
    );
  }
}
