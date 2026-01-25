import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      id?: string
      email?: string
      name?: string
      currentPassword?: string
      newPassword?: string
    }

    const userId = body.id
    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 })
    }

    // admin is hard-coded in your app (not in DB)
    if (userId === "admin") {
      return NextResponse.json(
        { success: false, message: "Admin profile cannot be edited (hard-coded account)" },
        { status: 400 }
      )
    }

    const uid = Number(userId)
    if (!Number.isFinite(uid)) {
      return NextResponse.json({ success: false, message: "Invalid user id" }, { status: 400 })
    }

    // always require current password for any change
    if (!body.currentPassword) {
      return NextResponse.json({ success: false, message: "Current password is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: uid } })
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    const ok = await bcrypt.compare(body.currentPassword, user.password)
    if (!ok) {
      return NextResponse.json({ success: false, message: "Current password is incorrect" }, { status: 401 })
    }

    // prepare updates
    const dataToUpdate: any = {}

    if (typeof body.name === "string" && body.name.trim().length > 0) {
      dataToUpdate.name = body.name.trim()
    }

    if (typeof body.email === "string" && body.email.trim().length > 0) {
      dataToUpdate.email = body.email.trim().toLowerCase()
    }

    if (typeof body.newPassword === "string" && body.newPassword.trim().length > 0) {
      if (body.newPassword.trim().length < 6) {
        return NextResponse.json({ success: false, message: "New password must be at least 6 characters" }, { status: 400 })
      }
      dataToUpdate.password = await bcrypt.hash(body.newPassword.trim(), 10)
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ success: false, message: "Nothing to update" }, { status: 400 })
    }

    // unique email handling
    try {
      const updated = await prisma.user.update({
        where: { id: uid },
        data: dataToUpdate,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      })

      return NextResponse.json({
        success: true,
        user: {
          id: updated.id.toString(),
          name: updated.name,
          email: updated.email,
          role: updated.role,
          savedDestinations: [], // will be filled by /api/auth/me anyway
          savedItineraries: [],
        },
      })
    } catch (e: any) {
      // Prisma unique constraint error (email already exists)
      if (e?.code === "P2002") {
        return NextResponse.json({ success: false, message: "This email is already in use" }, { status: 409 })
      }
      throw e
    }
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
