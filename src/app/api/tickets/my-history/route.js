import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { serialize } from '@/lib/serialize';

// FUNGSI: Mengambil riwayat tiket yang di-submit oleh user yang login
export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Anda harus login' }, { status: 401 });
  }

  if (!['Salesman', 'Agen'].includes(session.user.role)) {
    return NextResponse.json(
      { message: 'Anda tidak diizinkan.' },
      { status: 403 }
    );
  }

  try {
    const tickets = await prisma.ticket.findMany({
      where: {
        submitted_by_user_id: session.user.id,
      },
      include: {
        detail: {
          select: {
            description: true,
            attachments_json: true,
          },
        },

        logs: {
          include: {
            actor: { select: { name: true } },
          },
          orderBy: {
            timestamp: 'asc',
          },
        },

        // Ambil penugasan yang masih 'Pending' (untuk tahu siapa PIC saat ini)
        assignments: {
          where: { status: 'Pending' },
          include: {
            user: {
              select: {
                name: true,
                role: {
                  select: {
                    role_name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(serialize(tickets));
  } catch (error) {
    console.error('Gagal mengambil riwayat tiket:', error);
    return NextResponse.json(
      { message: 'Gagal mengambil riwayat tiket.' },
      { status: 500 }
    );
  }
}
