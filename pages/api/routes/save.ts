import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession, AuthOptions } from 'next-auth';
import prisma from '../../../lib/prisma';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const session = await getServerSession(req, res, authOptions as AuthOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { name, description, points } = req.body;

  if (!name || !points || !Array.isArray(points)) {
    return res.status(400).json({ error: 'Invalid itinerary data' });
  }

  try {
    const newRoute = await prisma.route.create({
      data: {
        name,
        description,
        userId: parseInt(session.user.id),
        points: {
          create: points.map((point: any, index: number) => ({
            objectId: point.objectId,
            objectType: point.objectType,
            sequence: index + 1,
          })),
        },
      },
      include: {
        points: true,
      },
    });

    return res.status(201).json(newRoute);
  } catch (error) {
    console.error('Error saving itinerary:', error);
    return res.status(500).json({ error: 'Failed to save itinerary' });
  }
} 