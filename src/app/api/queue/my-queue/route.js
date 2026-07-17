import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { serialize } from '@/lib/serialize';

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Anda harus login' }, { status: 401 });
  }
  const isSS = session.user.role === 'PIC OMI (SS)';

  const { searchParams } = new URL(request.url);
  const assignmentType = searchParams.get('type');

  if (!assignmentType || !['Active', 'Feedback_Review'].includes(assignmentType)) {
    return NextResponse.json(
      { message: "Query parameter 'type' tidak valid." },
      { status: 400 }
    );
  }

  try {
    const assignments = await prisma.ticketAssignment.findMany({
      where: isSS
        ? {
            assignment_type: assignmentType,
            status: 'Pending',
            user: {
              role: { role_name: 'PIC OMI' },
            },
          }
        : {
            user_id: Number(session.user.id),
            assignment_type: assignmentType,
            status: 'Pending',
          },
      include: {
        user: {
          select: {
            user_id: true,
            name: true,
          },
        },
        ticket: {
          select: {
            ticket_id: true,
            title: true,
            type: true,
            status: true,
            createdAt: true,
            kategori: true,
            sub_kategori: true,
            jabatan: true,
            toko: true,
            nama_pengisi: true,
            no_telepon: true,
            submittedBy: { select: { name: true } },
            detail: {
              select: {
                description: true,
                attachments_json: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(serialize(assignments));
  } catch (error) {
    console.error('Gagal mengambil antrian:', error);
    return NextResponse.json(
      { message: 'Gagal mengambil antrian' },
      { status: 500 }
    );
  }
}
