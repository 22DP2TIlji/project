import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromId } from '@/lib/auth-utils';

// GET /api/users/liked-destinations/[destinationId] - Get liked destination status
export async function GET(request: Request, { params }: { params: { destinationId: string } }) {
  console.log('Received GET request for liked destination status');
  try {
    const { userId } = await request.json();
    console.log('GET liked destination status for userId:', userId, 'destinationId:', params.destinationId);

    const user = await getUserFromId(userId);
    if (!user) {
      console.log('GET liked destination: User not authenticated or found');
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    // Handle admin user (admin has no liked destinations)
    if (user.id === 'admin') {
      return NextResponse.json({ success: true, isLiked: false });
    }

    const existing = await prisma.userLikedDestination.findUnique({
      where: {
        userId_destinationId: {
          userId: parseInt(user.id),
          destinationId: parseInt(params.destinationId),
        },
      },
    });

    return NextResponse.json({ success: true, isLiked: !!existing });
  } catch (error) {
    console.error('Error checking liked destination:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/users/liked-destinations/[destinationId] - Add a liked destination for the current user
export async function POST(request: Request, { params }: { params: { destinationId: string } }) {
  console.log('Received POST request to add liked destination');
  try {
    const { userId } = await request.json();
    console.log('POST liked destination: userId =', userId, ', destinationId =', params.destinationId);

    const user = await getUserFromId(userId);
    if (!user) {
      console.log('POST liked destination: User not authenticated or found');
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const destinationId = params.destinationId;
    if (!destinationId) {
      console.log('POST liked destination: Destination ID is missing');
      return NextResponse.json({ success: false, message: 'Destination ID is required' }, { status: 400 });
    }

    // Handle admin user (admin can't like destinations)
    if (user.id === 'admin') {
      return NextResponse.json({ success: false, message: 'Admin user cannot like destinations' }, { status: 403 });
    }

    // Check if already liked
    console.log('Checking if destination is already liked...');
    const existing = await prisma.userLikedDestination.findUnique({
      where: {
        userId_destinationId: {
          userId: parseInt(user.id),
          destinationId: parseInt(destinationId),
        },
      },
    });

    if (existing) {
      console.log('Destination already liked');
      return NextResponse.json({ success: false, message: 'Destination already liked' }, { status: 409 });
    }

    console.log('Inserting liked destination...');
    await prisma.userLikedDestination.create({
      data: {
        userId: parseInt(user.id),
        destinationId: parseInt(destinationId),
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

// DELETE /api/users/liked-destinations/[destinationId] - Remove a liked destination for the current user
export async function DELETE(request: Request, { params }: { params: { destinationId: string } }) {
   console.log('Received DELETE request to remove liked destination');
   try {
     const { userId } = await request.json();
     console.log('DELETE liked destination: userId =', userId, ', destinationId from params =', params.destinationId);

     const user = await getUserFromId(userId);
     if (!user) {
        console.log('DELETE liked destination: User not authenticated or found');
       return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
     }

     const { destinationId } = params;
     const destIdNum = destinationId != null ? parseInt(String(destinationId), 10) : NaN;
     if (!Number.isFinite(destIdNum)) {
       return NextResponse.json({ success: false, message: 'Invalid destination ID' }, { status: 400 });
     }

     // Handle admin user (admin has no liked destinations)
     if (user.id === 'admin') {
       return NextResponse.json({ success: false, message: 'Admin user has no liked destinations' }, { status: 404 });
     }

     console.log('Deleting liked destination...');
     await prisma.userLikedDestination.delete({
       where: {
         userId_destinationId: {
           userId: parseInt(user.id),
           destinationId: destIdNum,
         },
       },
     });

     console.log('Successfully removed liked destination');
     return NextResponse.json({ success: true });
   } catch (error: any) {
     console.error('Error removing liked destination:', error);
     if (error.code === 'P2025') {
       return NextResponse.json({ success: false, message: 'Like not found' }, { status: 404 });
     }
     return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
   }
} 