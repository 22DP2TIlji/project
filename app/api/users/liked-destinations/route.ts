import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromId } from '@/lib/auth-utils';

// GET /api/users/liked-destinations - Get liked destinations for the current user
export async function GET(request: Request) {
  console.log('Received GET request for liked destinations');
  try {
    // Get user ID from request body (as per simplified auth setup)
    // Note: GET requests typically don't have a body, but we are using POST-like behavior for this simplified auth.
    // Consider revising auth for standard GET requests in production.
    const { userId } = await request.json(); // Assuming userId is passed in body for this simplified setup
    console.log('GET liked destinations for userId:', userId);

    const user = await getUserFromId(userId);
    if (!user) {
      console.log('GET liked destinations: User not authenticated or found');
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }
    console.log('User found for GET liked destinations:', user.id);

    // Handle admin user (no liked destinations for admin)
    if (user.id === 'admin') {
      return NextResponse.json({ success: true, likedDestinations: [] });
    }

    console.log('Fetching liked destination IDs...');
    const likedRows = await prisma.userLikedDestination.findMany({
      where: { userId: parseInt(user.id) },
      select: { destinationId: true },
    });

    const ids = likedRows.map((r) => r.destinationId);

    if (!ids.length) {
      return NextResponse.json({ success: true, likedDestinations: [] });
    }

    console.log('Fetching destination details...');
    const destinations = await prisma.destination.findMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ success: true, likedDestinations: destinations ?? [] });
  } catch (error) {
    console.error('Error fetching liked destinations:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/users/liked-destinations - Add a liked destination for the current user
export async function POST(request: Request) {
  console.log('Received POST request to add liked destination');
  try {
    // Get user ID and destination ID from request body
    const { userId, destinationId } = await request.json();
    console.log('POST liked destination: userId =', userId, ', destinationId =', destinationId);

    const user = await getUserFromId(userId);
    if (!user) {
      console.log('POST liked destination: User not authenticated or found');
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }
     console.log('User found for POST liked destination:', user.id);

    if (destinationId === undefined || destinationId === null) {
      return NextResponse.json({ success: false, message: 'Destination ID is required' }, { status: 400 });
    }

    const destIdNum = typeof destinationId === 'number' ? destinationId : parseInt(String(destinationId), 10)
    if (!Number.isFinite(destIdNum)) {
      return NextResponse.json({ success: false, message: 'Destination ID must be a number (save places from the Destinations list)' }, { status: 400 });
    }

    // Handle admin user (admin can't like destinations)
    if (user.id === 'admin') {
      return NextResponse.json({ success: false, message: 'Admin user cannot like destinations' }, { status: 403 });
    }

    // Check if already liked (optional, database primary key also prevents duplicates)
    console.log('Checking if destination is already liked...');
    const existing = await prisma.userLikedDestination.findUnique({
      where: {
        userId_destinationId: {
          userId: parseInt(user.id),
          destinationId: destIdNum,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ success: false, message: 'Destination already liked' }, { status: 409 });
    }

    await prisma.userLikedDestination.create({
      data: {
        userId: parseInt(user.id),
        destinationId: destIdNum,
      },
    });

    console.log('Successfully added liked destination');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error adding liked destination:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, message: 'Destination already liked' }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
} 