// app/api/route/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const startLat = searchParams.get("startLat");
  const startLng = searchParams.get("startLng");
  const endLat = searchParams.get("endLat");
  const endLng = searchParams.get("endLng");

  if (!startLat || !startLng || !endLat || !endLng) {
    return NextResponse.json({ success: false, message: "Missing coords" }, { status: 400 });
  }

  // OSRM expects: lng,lat
  const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) {
    return NextResponse.json({ success: false, message: "OSRM error" }, { status: 502 });
  }

  const data = await res.json();
  const r = data?.routes?.[0];

  if (!r?.geometry?.coordinates?.length) {
    return NextResponse.json({ success: false, message: "No route found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    geometry: r.geometry, // GeoJSON LineString
    distanceKm: Math.round((r.distance / 1000) * 10) / 10,
    timeMinutes: Math.round(r.duration / 60),
  });
}
