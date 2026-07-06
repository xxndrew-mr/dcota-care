// Lokasi: src/app/api/tickets/[ticketId]/ap-process/route.js

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { sendTicketAssignedEmail } from '@/lib/email';
import { getRoutingTarget } from '@/lib/smartRouting';

// FUNGSI: Acting PIC memproses tiket (Complete, Return).
export async function POST(request, context) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'Acting PIC') {
    return NextResponse.json({ message: 'Anda tidak diizinkan.' }, { status: 403 });
  }

  const actingPicUser = session.user;
  const { ticketId: ticketIdParam } = await context.params;

  if (!ticketIdParam) {
    return NextResponse.json({ message: 'ticketId tidak ditemukan di URL.' }, { status: 400 });
  }

  const ticketId = Number(ticketIdParam);
  if (Number.isNaN(ticketId)) {
    return NextResponse.json({ message: 'ticketId tidak valid.' }, { status: 400 });
  }

  const { action, notes } = await request.json();
  if (!['complete', 'return'].includes(action)) {
    return NextResponse.json({ message: 'Aksi tidak valid.' }, { status: 400 });
  }
  if (!notes || notes.trim() === '') {
    return NextResponse.json({ message: 'Catatan wajib diisi.' }, { status: 400 });
  }

  const currentAssignment = await prisma.ticketAssignment.findFirst({
    where: {
      ticket_id: BigInt(ticketId),
      user_id: actingPicUser.id,
      assignment_type: 'Active',
      status: 'Pending',
    },
  });

  if (!currentAssignment) {
    return NextResponse.json({ message: 'Anda tidak ditugaskan untuk tiket ini.' }, { status: 403 });
  }

  try {
    let updatedTicket = null; // <- perbaikan 1
    let submitter = null;

    const result = await prisma.$transaction(async (tx) => {
      await tx.ticketAssignment.delete({
        where: { assignment_id: currentAssignment.assignment_id },
      });

      await tx.ticketLog.create({
        data: {
          ticket_id: BigInt(ticketId),
          actor_user_id: actingPicUser.id,
          action_type: `ap_${action}`,
          notes: notes,
        },
      });

      if (action === 'complete') {
        updatedTicket = await tx.ticket.update({
          where: { ticket_id: BigInt(ticketId) },
          data: { status: 'Done' },
        });
      } else if (action === 'return') {
        const ticket = await tx.ticket.findUnique({
          where: { ticket_id: BigInt(ticketId) },
        });
        if (!ticket) throw new Error('Tiket tidak ditemukan.');

        const target = getRoutingTarget(ticket.kategori);
        if (!target) throw new Error(`Mapping routing tidak ditemukan untuk kategori: ${ticket.kategori}`);

        const actingManagerUser = await tx.user.findFirst({
          where: {
            role: { role_name: 'Acting Manager' },
            division: { division_name: target.am_division },
            status: 'Active',
          },
        });
        if (!actingManagerUser) throw new Error(`User Acting Manager untuk ${target.am_division} tidak ditemukan.`);

        await tx.ticketAssignment.create({
          data: {
            ticket_id: BigInt(ticketId),
            user_id: actingManagerUser.user_id,
            assignment_type: 'Active',
            status: 'Pending',
          },
        });

        updatedTicket = ticket;
      }

      submitter = await tx.user.findUnique({
        where: { user_id: updatedTicket.submitted_by_user_id }, // <- perbaikan 2
        select: { email: true, name: true },
      });

      return { updatedTicket, submitter }; // <- perbaikan 3
    });

    if (action === 'complete' && result.submitter?.email) {
      sendTicketAssignedEmail({
        to: result.submitter.email,
        subject: `[Helpdesk GT] Request Anda (#${ticketId}) telah selesai`,
        ticket: result.updatedTicket,
        extraText:
          'Request Anda telah diselesaikan oleh PIC Divisi, cek status di website resmi Helpdesk-GT. Terima kasih.',
      }).catch((err) => console.error('Gagal kirim email ke submitter:', err));
    }

    return NextResponse.json({ message: `Aksi '${action}' berhasil dieksekusi.` }, { status: 200 });
  } catch (error) {
    console.error('Gagal memproses tiket (AP):', error);
    return NextResponse.json({ message: 'Gagal memproses tiket.', error: error.message }, { status: 500 });
  }
}
