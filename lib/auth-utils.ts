// lib/auth-utils.ts
import prisma from './prisma'

export async function getUserFromId(userId: string) {
  try {
    // Apstrādājam speciālo administratora gadījumu
    if (userId === 'admin') {
      return {
        id: 'admin',
        name: 'Administrators',
        email: 'admin@gmail.com',
        role: 'admin',
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    if (!user) {
      return null
    }

    return {
      ...user,
      id: user.id.toString(),
    }
  } catch (error) {
    console.error('Kļūda, mēģinot iegūt lietotāju:', error)
    return null
  }
}