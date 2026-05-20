import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

// Iegūst visus lietotājus administratora panelim
export async function GET() {
  try {
    const users = (await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })) as UserData[];

    // Pārveidojam ID par tekstu, lai saglabātu vienotu formātu
    const usersWithStringIds = users.map((user: UserData) => ({
      ...user,
      id: user.id.toString(),
      created_at: user.createdAt,
      lastLogin: user.updatedAt,
    }));

    const totalRoutes = await prisma.route.count();

    return NextResponse.json({
      success: true,
      users: usersWithStringIds,
      totalRoutes,
    });
  } catch (error) {
    console.error("GET /api/admin/users kļūda:", error);

    return NextResponse.json(
      { success: false, message: "Iekšēja servera kļūda" },
      { status: 500 },
    );
  }
}

// Pievieno jaunu lietotāju administratora panelī
export async function POST(request: Request) {
  try {
    const {
      name,
      email,
      password,
      role = "user",
    } = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      role?: "user" | "admin";
    };

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { success: false, message: "Nepieciešams vārds, e-pasts un parole" },
        { status: 400 },
      );
    }

    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Parolei jābūt vismaz 8 rakstzīmes garai, ar vienu lielo burtu, vienu ciparu un vienu speciālo simbolu.",
        },
        { status: 400 },
      );
    }

    const userRole = role === "admin" ? "admin" : "user";
    const hashedPassword = await bcrypt.hash(password, 10);
    const created = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        password: hashedPassword,
        role: userRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        ...created,
        id: created.id.toString(),
        created_at: created.createdAt,
      },
    });
  } catch (error: any) {
    console.error("POST /api/admin/users kļūda:", error);
    if (error?.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "E-pasts jau eksistē" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { success: false, message: "Iekšēja servera kļūda" },
      { status: 500 },
    );
  }
}

// Atjaunina lietotāja lomu
export async function PUT(request: Request) {
  const { id, role } = await request.json();

  if (!id || !role) {
    return NextResponse.json(
      { success: false, message: "Nepieciešams lietotāja ID un loma" },
      { status: 400 },
    );
  }

  // Administratora lietotāja lomu nedrīkst mainīt
  if (id === "admin") {
    return NextResponse.json(
      { success: false, message: "Administratora lietotāju nedrīkst mainīt" },
      { status: 403 },
    );
  }

  try {
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role: role as "user" | "admin" },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Kļūda, atjauninot lietotāja lomu:", error);

    if (error.code === "P2025") {
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
