import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export async function POST(request, context) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { message: 'Anda tidak diizinkan.' },
      { status: 403 }
    );
  }

  const loggedInUser = session.user;
  const { assignmentId } = await context.params;

  if (!assignmentId || isNaN(Number(assignmentId))) {
    return NextResponse.json(
      { message: 'Assignment ID tidak valid.' },
      { status: 400 }
    );
  }

  let action;
  try {
    ({ action } = await request.json());
  } catch {
    return NextResponse.json(
      { message: 'Format request body tidak valid.' },
      { status: 400 }
    );
  }

  if (!['bookmark', 'archive'].includes(action)) {
    return NextResponse.json(
      { message: 'Aksi tidak valid.' },
      { status: 400 }
    );
  }

  const currentAssignment = await prisma.ticketAssignment.findUnique({
    where: {
      assignment_id: BigInt(assignmentId),
    },
  });

  if (!currentAssignment || currentAssignment.user_id !== loggedInUser.id) {
    return NextResponse.json(
      { message: 'Anda tidak ditugaskan untuk feedback ini.' },
      { status: 403 }
    );
  }

  // Hanya assignment review feedback yang boleh di-bookmark/arsip — assignment
  // 'Active' adalah bagian rantai approval dan tidak boleh ditutup lewat sini.
  if (currentAssignment.assignment_type !== 'Feedback_Review') {
    return NextResponse.json(
      { message: 'Assignment ini bukan tugas review feedback.' },
      { status: 403 }
    );
  }

  if (currentAssignment.status !== 'Pending') {
    return NextResponse.json(
      { message: 'Feedback ini sudah diproses.' },
      { status: 409 }
    );
  }

  try {
    const newStatus =
      action === 'bookmark' ? 'Bookmarked' : 'Archived';

    await prisma.$transaction([
      prisma.ticketAssignment.update({
        where: {
          assignment_id: BigInt(assignmentId),
        },
        data: {
          status: newStatus,
        },
      }),
      prisma.ticketLog.create({
        data: {
          ticket_id: currentAssignment.ticket_id,
          actor_user_id: loggedInUser.id,
          action_type: `feedback_${action}`,
          notes: `Feedback ${action === 'bookmark' ? 'di-bookmark' : 'diarsipkan'} oleh ${loggedInUser.name || 'User Feedback'}.`,
        },
      }),
    ]);

    return NextResponse.json(
      { message: `Aksi '${action}' berhasil dieksekusi.` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Gagal memproses feedback:', error);
    return NextResponse.json(
      { message: 'Gagal memproses feedback.' },
      { status: 500 }
    );
  }
}