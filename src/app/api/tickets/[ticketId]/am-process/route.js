import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { getRoutingTarget } from '@/lib/smartRouting';
import { sendTicketAssignedEmail } from '@/lib/email';

export async function POST(request, context) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'Acting Manager') {
    return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
  }

  const { ticketId: ticketIdParam } = await context.params;

  if (!ticketIdParam) {
    return NextResponse.json({ message: 'ticketId tidak ditemukan di URL.' }, { status: 400 });
  }

  const ticketId = Number(ticketIdParam);
  if (Number.isNaN(ticketId)) {
    return NextResponse.json({ message: 'ticketId tidak valid.' }, { status: 400 });
  }

  const { action, notes } = await request.json();

  if (!['approve', 'reject'].includes(action)) return NextResponse.json({ message: 'Aksi tidak valid.' }, { status: 400 });
  if (!notes) return NextResponse.json({ message: 'Catatan wajib.' }, { status: 400 });

  const currentAssignment = await prisma.ticketAssignment.findFirst({
    where: {
      ticket_id: BigInt(ticketId),
      user_id: session.user.id,
      status: 'Pending',
      assignment_type: 'Active',
    },
    include: { ticket: true }
  });

  if (!currentAssignment) return NextResponse.json({ message: 'Tugas tidak ditemukan.' }, { status: 403 });

  try {
    let updatedTicket = null;
    let targetAP = null;

    const result = await prisma.$transaction(async (tx) => {
      await tx.ticketAssignment.delete({ where: { assignment_id: currentAssignment.assignment_id } });

      await tx.ticketLog.create({
        data: {
          ticket_id: BigInt(ticketId),
          actor_user_id: session.user.id,
          action_type: `am_${action}`,
          notes: notes,
        },
      });

      if (action === 'approve') {
        const kategori = currentAssignment.ticket.kategori;
        const target = getRoutingTarget(kategori);

        if (!target) throw new Error(`Mapping routing tidak ditemukan untuk kategori: ${kategori}`);

        targetAP = await tx.user.findFirst({
          where: {
            role: { role_name: 'Acting PIC' },
            division: { division_name: target.ap_division },
            status: 'Active'
          },
          select: { user_id: true, email: true, name: true },
        });

        if (!targetAP) throw new Error(`User Acting PIC untuk ${target.ap_division} tidak ditemukan.`);

        updatedTicket = await tx.ticketAssignment.create({
          data: {
            ticket_id: BigInt(ticketId),
            user_id: targetAP.user_id,
            assignment_type: 'Active',
            status: 'Pending',
          },
        });

      } else if (action === 'reject') {
        updatedTicket = await tx.ticket.update({
          where: { ticket_id: BigInt(ticketId) },
          data: { status: 'Rejected' },
        });
      }

      return { updatedTicket, targetAP };
    });

    if (action === 'approve' && result.targetAP?.email) {
      sendTicketAssignedEmail({
        to: result.targetAP.email,
        subject: `[Helpdesk GT] Pending Request Baru (#${ticketId}) - Menunggu proses PIC Divisi`,
        ticket: currentAssignment.ticket,
        extraText: `Ticket telah di-approve oleh Manager dan menunggu proses Anda.`,
      }).catch((err) => console.error('Gagal kirim email AM→AP:', err));
    }

    return NextResponse.json({ message: `Aksi '${action}' berhasil.` }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
