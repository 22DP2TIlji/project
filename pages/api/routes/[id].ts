import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession, AuthOptions } from 'next-auth';
import prisma from '../../../lib/prisma';
import { authOptions } from '../../auth/[...nextauth]'; // Corrected path

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const session = await getServerSession(req, res, authOptions as AuthOptions);

  // Itinerary might be public, or only accessible by owner. Let's assume for now
  // it's only accessible by the owner for simplicity, matching the save logic.
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid itinerary ID' });
  }

  try {
    const itineraryId = parseInt(id);
    if (isNaN(itineraryId)) {
       return res.status(400).json({ error: 'Invalid itinerary ID' });
    }

    const itinerary = await prisma.route.findFirst({
      where: {
        id: itineraryId,
        userId: parseInt(session.user.id), // Ensure only owner can fetch
      },
      include: {
        points: { // Include points associated with the route
          orderBy: {
            sequence: 'asc', // Order points by sequence
          },
        },
      },
    });

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    return res.status(200).json(itinerary);
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    return res.status(500).json({ error: 'Failed to fetch itinerary' });
  }
} 