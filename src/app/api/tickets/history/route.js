import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { serialize } from '@/lib/serialize';

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const userRole = session.user.role;

  const { searchParams } = new URL(request.url);
  const divisionIdsParam = searchParams.get('division_ids');

  // parse ?division_ids=1,2,3
  const divisionIds = divisionIdsParam
    ? divisionIdsParam.split(',').map((id) => parseInt(id, 10))
    : [];

  let whereClause = {};

  // PIC OMI (SS): semua tiket yang pernah ditangani sesama PIC OMI (SS)
  if (userRole === 'PIC OMI (SS)') {
    whereClause = {
      logs: {
        some: {
          actor: {
            role: {
              role_name: 'PIC OMI (SS)',
            },
          },
        },
      },
    };
  }

  // Role operasional lain: hanya tiket yang pernah dia proses sendiri
  else if (userRole !== 'Viewer' && userRole !== 'Administrator') {
    whereClause = {
      logs: {
        some: {
          actor_user_id: userId,
        },
      },
    };
  }

  // Viewer/Administrator boleh memfilter per divisi
  if (
    (userRole === 'Viewer' || userRole === 'Administrator') &&
    divisionIds.length > 0
  ) {
    whereClause = {
      ...whereClause,
      submittedBy: {
        division_id: { in: divisionIds },
      },
    };
  }

  try {
    const tickets = await prisma.ticket.findMany({
      where: whereClause,
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
            role: {
              select: { role_name: true },
            },
          },
        },
        logs: {
          orderBy: { timestamp: 'desc' },
          take: 1,
          select: {
            timestamp: true,
            notes: true,
            actor: {
              select: { name: true },
            },
          },
        },
        assignments: {
          where: { status: 'Pending' },
          include: {
            user: {
              select: {
                name: true,
                role: { select: { role_name: true } },
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(serialize(tickets));
  } catch (error) {
    console.error('Gagal mengambil riwayat aksi:', error);
    return NextResponse.json(
      { message: 'Gagal mengambil data.' },
      { status: 500 }
    );
  }
}
