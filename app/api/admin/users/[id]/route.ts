import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function parseId(id: string): number | null {
  const n = Number(id);
  return Number.isFinite(n) ? n : null;
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  const userId = parseId(params.id);
  if (userId == null) {
    return NextResponse.json(
      { success: false, message: "Nederīgs lietotāja ID" },
      { status: 400 },
    );
  }

  try {
    const routes = await prisma.route.findMany({
      where: { userId },
      select: { id: true },
    });
    const routeIds = routes.map((r:{id: number }) => r.id);

    await prisma
      .$executeRawUnsafe(
        "DELETE FROM user_visited_destinations WHERE user_id = ?",
        userId,
      )
      .catch(() => undefined);

    await prisma.$transaction([
      prisma.routeComment.deleteMany({ where: { routeId: { in: routeIds } } }),
      prisma.routeLike.deleteMany({ where: { routeId: { in: routeIds } } }),
      prisma.routePoint.deleteMany({ where: { routeId: { in: routeIds } } }),
      prisma.route.deleteMany({ where: { userId } }),
      prisma.routeComment.deleteMany({ where: { userId } }),
      prisma.routeLike.deleteMany({ where: { userId } }),
      prisma.review.deleteMany({ where: { userId } }),
      prisma.userLikedDestination.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("DELETE /api/admin/users/[id] error:", err);
    const code =
      err && typeof err === "object" && "code" in err
        ? (err as { code: string }).code
        : null;
    if (code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Lietotājs nav atrasts" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { success: false, message: "Iekšēja servera kļūda" },
      { status: 500 },
    );
  }
}
