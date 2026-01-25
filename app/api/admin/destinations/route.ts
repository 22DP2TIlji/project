// app/api/admin/destinations/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Принимаем imageUrl как string или string[]
function normalizeImageUrls(imageUrl: unknown): string[] {
  if (!imageUrl) return [];

  // если пришёл массив
  if (Array.isArray(imageUrl)) {
    return imageUrl
      .filter((x) => typeof x === "string")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // если пришла строка
  if (typeof imageUrl === "string") {
    const s = imageUrl.trim();
    if (!s) return [];

    // поддержка "url1, url2" если вдруг присылаешь так
    if (s.includes(",") && !s.startsWith("data:")) {
      return s
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
    }

    return [s];
  }

  return [];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const description = typeof body?.description === "string" ? body.description.trim() : "";
    const category = typeof body?.category === "string" ? body.category.trim() : null;
    const region = typeof body?.region === "string" ? body.region.trim() : null;

    // ⚠️ важно: тут мы НЕ удаляем data:image/...;base64 — мы его сохраняем как есть
    const imageUrlRaw = body?.imageUrl;
    const urls = normalizeImageUrls(imageUrlRaw);

    console.log("✅ /api/admin/destinations POST body:", {
      name,
      description,
      category,
      region,
      imageUrlPreview:
        typeof imageUrlRaw === "string"
          ? imageUrlRaw.slice(0, 80) + "..."
          : Array.isArray(imageUrlRaw)
          ? `array(${imageUrlRaw.length})`
          : typeof imageUrlRaw,
    });
    console.log("🖼️ normalized urls:", urls.map((u) => u.slice(0, 60) + (u.length > 60 ? "..." : "")));

    if (!name || !description) {
      return NextResponse.json(
        { success: false, message: "Name and description are required" },
        { status: 400 }
      );
    }

    // 1) создаём destination
    const destination = await prisma.destination.create({
      data: {
        name,
        description,
        category,
        region,
      },
      select: { id: true },
    });

    // 2) сохраняем картинки (если есть)
    if (urls.length > 0) {
      await prisma.image.createMany({
        data: urls.map((url) => ({
          url,
          destinationId: destination.id,
        })),
      });
    }

    // 3) ответ
    return NextResponse.json({
      success: true,
      id: destination.id,
      debug: { urlsSaved: urls.length },
    });
  } catch (err) {
    console.error("❌ Error in POST /api/admin/destinations:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: String(err) },
      { status: 500 }
    );
  }
}
