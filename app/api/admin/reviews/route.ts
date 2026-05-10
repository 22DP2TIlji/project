import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const destinationIdParam =
      request.nextUrl.searchParams.get("destinationId");
    const destinationId = destinationIdParam
      ? Number(destinationIdParam)
      : undefined;

    const where =
      destinationId != null && Number.isFinite(destinationId)
        ? { objectId: destinationId, objectType: "attraction" as any }
        : { objectType: "attraction" as any };

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { id: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    const destinationIds = Array.from(new Set(reviews.map((r) => r.objectId)));
    const destinations = await prisma.destination.findMany({
      where: { id: { in: destinationIds } },
      select: { id: true, name: true },
    });
    const destMap = Object.fromEntries(destinations.map((d) => [d.id, d.name]));

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
    }));

    return NextResponse.json({ success: true, reviews: list });
  } catch (err) {
    console.error("GET /api/admin/reviews error:", err);
    return NextResponse.json(
      { success: false, message: "Iekšēja servera kļūda" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      destinationId?: string | number;
      userId?: string | number;
      rating?: string | number;
      comment?: string;
    };

    const destinationId = Number(body.destinationId);
    const userId = Number(body.userId);
    const rating = Number(body.rating);
    const comment = typeof body.comment === "string" ? body.comment.trim() : "";

    if (!Number.isFinite(destinationId) || !Number.isFinite(userId)) {
      return NextResponse.json(
        { success: false, message: "Nepieciešams galamērķis un lietotājs" },
        { status: 400 },
      );
    }
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Vērtējumam jābūt no 1 līdz 5" },
        { status: 400 },
      );
    }
    if (!comment) {
      return NextResponse.json(
        { success: false, message: "Komentārs ir obligāts" },
        { status: 400 },
      );
    }

    const created = await prisma.review.create({
      data: {
        objectId: destinationId,
        objectType: "attraction" as any,
        userId,
        rating,
        comment,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    const destination = await prisma.destination.findUnique({
      where: { id: destinationId },
      select: { name: true },
    });

    return NextResponse.json({
      success: true,
      review: {
        id: created.id,
        userId: created.userId,
        userName: created.user.name,
        userEmail: created.user.email,
        objectId: created.objectId,
        destinationName: destination?.name ?? `#${created.objectId}`,
        rating: created.rating,
        comment: created.comment,
        createdAt: created.createdAt,
      },
    });
  } catch (err) {
    console.error("POST /api/admin/reviews error:", err);
    return NextResponse.json(
      { success: false, message: "Iekšēja servera kļūda" },
      { status: 500 },
    );
  }
}
