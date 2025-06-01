import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession, AuthOptions } from 'next-auth';
import prisma from '../../../lib/prisma';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as AuthOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const likedDestinations = await prisma.userLikedDestination.findMany({
      where: {
        userId: parseInt(session.user.id),
      },
      include: {
        destination: true,
      },
    });

    return res.status(200).json(likedDestinations);
  } catch (error) {
    console.error('Error fetching liked destinations:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 