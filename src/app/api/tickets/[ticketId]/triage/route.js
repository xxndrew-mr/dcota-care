import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { getRoutingTarget } from '@/lib/smartRouting';
import { sendTicketAssignedEmail } from '@/lib/email';

export async function POST(request, context) {
  const params = await context.params;
  const rawId = params.ticketId;

  if (!rawId || isNaN(Number(rawId))) {
    return NextResponse.json({ message: 'Ticket ID tidak valid.' }, { status: 400 });
  }

  const ticketId = BigInt(rawId);

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const role = session.user.role;
  const isSS = role === 'PIC OMI (SS)';

  if (!['PIC OMI', 'PIC OMI (SS)'].includes(role)) {
    return NextResponse.json({ message: 'Anda tidak diizinkan.' }, { status: 403 });
  }

  const { type, notes } = await request.json();

  if (!['Request', 'Feedback'].includes(type)) {
    return NextResponse.json(
      { message: "Tipe harus 'Request' atau 'Feedback'." },
      { status: 400 }
    );
  }

  let currentAssignment;
  if (isSS) {
    currentAssignment = await prisma.ticketAssignment.findFirst({
      where: { ticket_id: ticketId, status: 'Pending', assignment_type: 'Active' },
      include: { ticket: { include: { submittedBy: true } } },
    });
  } else {
    currentAssignment = await prisma.ticketAssignment.findFirst({
      where: { ticket_id: ticketId, user_id: Number(session.user.id), status: 'Pending', assignment_type: 'Active' },
      include: { ticket: { include: { submittedBy: true } } },
    });
  }

  if (!currentAssignment) {
    return NextResponse.json({ message: 'Ticket sudah diproses atau tidak valid.' }, { status: 403 });
  }

  // Tolak triase ulang: setelah lolos triage, type tiket berubah dari 'Pending'
  // dan assignment Active Pending berikutnya milik approver (SM/AM/AP) — tanpa
  // guard ini, PIC OMI (SS) bisa me-reset tiket yang sedang berjalan.
  if (currentAssignment.ticket.type !== 'Pending') {
    return NextResponse.json(
      { message: 'Ticket sudah di-triase dan sedang diproses.' },
      { status: 409 }
    );
  }

  const submitter = currentAssignment.ticket.submittedBy;
  const submitterDivisionId = submitter.division_id;
  const kategori = currentAssignment.ticket.kategori;

  // Cari target routing SEBELUM transaksi — assignment lama tidak boleh
  // ditutup kalau penerima berikutnya tidak ada (tiket menggantung tanpa antrian).
  let salesManagerUser = null;
  let feedbackUsers = [];

  try {
    salesManagerUser = await prisma.user.findFirst({
      where: { role: { role_name: 'Sales Manager' }, status: 'Active', division_id: submitterDivisionId },
      select: { user_id: true, email: true, name: true },
    });

    if (type === 'Feedback') {
      const target = getRoutingTarget(kategori);

      // Prioritaskan User Feedback di divisi tujuan kategori; kalau divisi itu
      // tidak punya User Feedback, fallback ke semua User Feedback agar tiket
      // tidak pernah kehilangan penerima.
      if (target?.ap_division) {
        feedbackUsers = await prisma.user.findMany({
          where: { role: { role_name: 'User Feedback' }, division: { division_name: target.ap_division } },
          select: { user_id: true, email: true, name: true },
        });
      }

      if (feedbackUsers.length === 0) {
        feedbackUsers = await prisma.user.findMany({
          where: { role: { role_name: 'User Feedback' } },
          select: { user_id: true, email: true, name: true },
        });
      }
    }
  } catch (err) {
    console.error('Gagal ambil Sales Manager / Feedback Users:', err);
    return NextResponse.json(
      { message: 'Gagal memeriksa target routing.', error: err.message },
      { status: 500 }
    );
  }

  if (type === 'Request' && !salesManagerUser) {
    return NextResponse.json(
      { message: 'Sales Manager aktif untuk divisi pengaju tidak ditemukan. Hubungi Admin.' },
      { status: 422 }
    );
  }

  if (type === 'Feedback' && feedbackUsers.length === 0) {
    return NextResponse.json(
      { message: 'User dengan role User Feedback tidak ditemukan. Hubungi Admin.' },
      { status: 422 }
    );
  }

  let updatedTicket;
  try {
    await prisma.$transaction(async (tx) => {
      // Kondisi `type: 'Pending'` mencegah race double-triage: bila dua user
      // men-triase hampir bersamaan, eksekusi kedua meng-update 0 baris dan gagal.
      const triaged = await tx.ticket.updateMany({
        where: { ticket_id: ticketId, type: 'Pending' },
        data: { type, status: 'Open' },
      });

      if (triaged.count === 0) {
        throw new Error('Tiket sudah di-triase oleh user lain.');
      }

      updatedTicket = await tx.ticket.findUnique({
        where: { ticket_id: ticketId },
      });

      await tx.ticketAssignment.updateMany({
        where: { ticket_id: ticketId, assignment_type: 'Active', status: 'Pending' },
        data: { status: 'Done' },
      });

      await tx.ticketLog.create({
        data: {
          ticket_id: ticketId,
          actor_user_id: session.user.id,
          action_type: 'Triase',
          notes: `Triase oleh ${role}: ${type}. Catatan: ${notes || '-'}`,
        },
      });
    });
  } catch (err) {
    console.error('Gagal triase:', err);
    return NextResponse.json({ message: 'Gagal melakukan triase.', error: err.message }, { status: 500 });
  }

  if (salesManagerUser) {
    prisma.ticketAssignment.create({
      data: {
        ticket_id: ticketId,
        user_id: salesManagerUser.user_id,
        assignment_type: type === 'Request' ? 'Active' : 'Feedback_Review',
        status: 'Pending',
      },
    }).catch(err => console.error('Gagal assign Sales Manager:', err));
  }

  if (feedbackUsers.length > 0) {
    prisma.ticketAssignment.createMany({
      data: feedbackUsers.map(fb => ({
        ticket_id: ticketId,
        user_id: fb.user_id,
        assignment_type: 'Feedback_Review',
        status: 'Pending',
      })),
    }).catch(err => console.error('Gagal assign Feedback Users:', err));
  }

  const ticketNumber = rawId;

  if (salesManagerUser?.email) {
    sendTicketAssignedEmail({
      to: salesManagerUser.email,
      subject: `${type} baru (#${ticketNumber})`,
      ticket: updatedTicket,
      extraText: `Anda mendapatkan tugas baru dari PIC OMI.`,
    }).catch(err => console.error('Gagal kirim email Sales Manager:', err));
  }

  if (type === 'Feedback') {
    for (const fbUser of feedbackUsers) {
      if (!fbUser.email) continue;
      sendTicketAssignedEmail({
        to: fbUser.email,
        subject: `Feedback baru (#${ticketNumber})`,
        ticket: updatedTicket,
        extraText: `Anda mendapatkan tugas review feedback.`,
      }).catch(err => console.error('Gagal kirim email Feedback User:', err));
    }
  }

  return NextResponse.json({ message: `Tiket berhasil di-triase sebagai ${type}.` }, { status: 200 });
}
