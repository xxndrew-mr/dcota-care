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

  try {
    const isViewer = session.user.role === 'Viewer';

    const assignments = await prisma.ticketAssignment.findMany({
      where: {
        status: 'Archived',
        assignment_type: 'Feedback_Review',

        // Jika bukan Viewer, hanya arsip milik sendiri
        ...(isViewer
          ? {} 
          : { user_id: session.user.id }
        ),
      },
      include: {
        user: {
          select: {
            name: true,
            role: true,
            division: true,
          },
        },
        ticket: {
          include: {
            submittedBy: {
              select: { name: true, division: true },
            },
            detail: {
              select: {
                description: true,
                attachments_json: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(serialize(assignments));
  } catch (error) {
    console.error('Error fetching archive:', error);
    return NextResponse.json({ message: 'Error server' }, { status: 500 });
  }
}
