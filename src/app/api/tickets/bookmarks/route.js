import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { serialize } from '@/lib/serialize';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const isViewer = session.user.role === 'Viewer';
  const allowedRoles = ['PIC OMI', 'Sales Manager', 'User Feedback'];

  if (!isViewer && !allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const tickets = await prisma.ticket.findMany({
      where: {
        assignments: {
          some: {
            status: 'Bookmarked',
            assignment_type: 'Feedback_Review',
            ...(isViewer
              ? {}
              : { user_id: session.user.id }
            ),
          },
        },
      },
      include: {
        detail: {
          select: {
            description: true,
            attachments_json: true,
          },
        },
        submittedBy: {
          select: {
            name: true,
            division: true,
          },
        },
        assignments: {
          where: {
            status: 'Bookmarked',
            assignment_type: 'Feedback_Review',
          },
          include: {
            user: {
              select: {
                name: true,
                role: true,
                division: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc'
      },
    });

    return NextResponse.json(serialize(tickets));
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json({ message: 'Error server' }, { status: 500 });
  }
}