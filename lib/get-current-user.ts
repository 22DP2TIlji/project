import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

// CHANGE this name if your cookie is named differently:
const COOKIE_NAME = "token"; // or "auth_token" etc.

export async function getCurrentUser() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  // If your token is actually "userId", then parse it:
  // const userId = Number(token)

  // If you store userId in cookie directly:
  const userId = Number(token);
  if (!userId || Number.isNaN(userId)) return null;

  return prisma.user.findUnique({ where: { id: userId } });
}
