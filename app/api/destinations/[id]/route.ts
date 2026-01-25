import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const destinationId = Number(params.id)
  if (!Number.isFinite(destinationId)) {
    return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 })
  }

  const destination = await prisma.destination.findUnique({
    where: { id: destinationId },
    include: { images: true },
  })

  if (!destination) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true, destination })
}
