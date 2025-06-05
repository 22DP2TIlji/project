import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const accommodations = await prisma.accommodation.findMany();
    return res.status(200).json(accommodations);
  } catch (error) {
    console.error('Error fetching accommodations:', error);
    return res.status(500).json({ error: 'Failed to fetch accommodations' });
  }
} 