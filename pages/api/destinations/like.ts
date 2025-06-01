import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession, AuthOptions } from 'next-auth';
import prisma from '../../../lib/prisma';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as AuthOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { destinationId } = req.body;

  if (!destinationId) {
    return res.status(400).json({ error: 'Destination ID is required' });
  }

  try {
    if (req.method === 'POST') {
      // Like a destination
      const like = await prisma.userLikedDestination.create({
        data: {
          userId: parseInt(session.user.id),
          destinationId: parseInt(destinationId),
        },
      });
      return res.status(200).json(like);
    } else if (req.method === 'DELETE') {
      // Unlike a destination
      await prisma.userLikedDestination.delete({
        where: {
          userId_destinationId: {
            userId: parseInt(session.user.id),
            destinationId: parseInt(destinationId),
          },
        },
      });
      return res.status(200).json({ message: 'Destination unliked successfully' });
    } else {
      res.setHeader('Allow', ['POST', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error handling destination like:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 