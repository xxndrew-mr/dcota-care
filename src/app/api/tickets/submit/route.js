import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { sendTicketAssignedEmail } from '@/lib/email';
import { getRoutingTarget } from '@/lib/smartRouting';
import { serialize } from '@/lib/serialize';

const REQUIRED_ATTACHMENT_RULES = ['PRODUK'];

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['Salesman', 'Agen'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    const user = session.user;

    const {
      title,
      description,
      kategori,
      jabatan,
      toko,
      attachments,
      phone,
    } = await request.json();

    if (!title || !description || !kategori) {
      return NextResponse.json({ message: 'Data tidak lengkap.' }, { status: 400 });
    }

    if (user.role === 'Agen' && !jabatan) {
      return NextResponse.json({ message: 'Agen wajib mengisi Jabatan.' }, { status: 400 });
    }

    const isAttachmentRequired = REQUIRED_ATTACHMENT_RULES.includes(
      kategori.toUpperCase()
    );

    if (isAttachmentRequired && (!attachments || attachments.length === 0)) {
      return NextResponse.json(
        { message: 'Lampiran wajib diisi untuk kategori PRODUK.' },
        { status: 400 }
      );
    }

    const routing = getRoutingTarget(kategori);

    if (!routing) {
      return NextResponse.json(
        { message: 'Routing kategori belum tersedia.' },
        { status: 400 }
      );
    }

    const submitter = await prisma.user.findUnique({
      where: { user_id: user.id },
      select: {
        name: true,
        phone: true,
        pic_omi_id: true,
      },
    });

    if (!submitter) {
      return NextResponse.json({ message: 'User tidak ditemukan.' }, { status: 404 });
    }

    const nama_pengisi = submitter.name;
    const no_telepon = phone || submitter.phone;

    if (!no_telepon) {
      return NextResponse.json({ message: 'Nomor telepon wajib diisi.' }, { status: 400 });
    }

    const cleanPhone = no_telepon.toString().replace(/[^0-9]/g, '');

    if (cleanPhone.length < 9) {
      return NextResponse.json(
        { message: 'Nomor telepon harus berupa minimal 9 digit angka.' },
        { status: 400 }
      );
    }

    const assignedPicOmiId = submitter.pic_omi_id;

    if (!assignedPicOmiId) {
      return NextResponse.json(
        { message: 'Akun belum dihubungkan ke PIC OMI. Hubungi Admin.' },
        { status: 422 }
      );
    }

    if (!submitter.phone && phone) {
      await prisma.user.update({
        where: { user_id: user.id },
        data: { phone: cleanPhone },
      });
    }

    const picOmiSSUsers = await prisma.user.findMany({
      where: {
        role: { role_name: 'PIC OMI (SS)' },
        status: 'Active',
      },
      select: {
        user_id: true,
        email: true,
        name: true,
      },
    });

    const picOmiUser = await prisma.user.findUnique({
      where: { user_id: assignedPicOmiId },
      select: {
        email: true,
        name: true,
      },
    });

    const ticket = await prisma.$transaction(async (tx) => {
      const t = await tx.ticket.create({
        data: {
          title,
          type: 'Pending',
          status: 'Open',
          kategori,
          sub_kategori: null,
          nama_pengisi,
          jabatan: jabatan || null,
          toko: toko || null,
          no_telepon: cleanPhone,
          submittedBy: { connect: { user_id: user.id } },
        },
      });

      await tx.ticketDetail.create({
        data: {
          ticket_id: t.ticket_id,
          description,
          attachments_json: attachments || [],
        },
      });

      await tx.ticketLog.create({
        data: {
          ticket_id: t.ticket_id,
          actor_user_id: user.id,
          action_type: 'Submit',
          notes:
            user.role === 'Salesman'
              ? `Tiket dibuat oleh Sales ${nama_pengisi} (${cleanPhone}) untuk ${toko || '-'}`
              : `Tiket dibuat oleh ${nama_pengisi} (${jabatan}) (${cleanPhone}).`,
        },
      });

      const assignments = [
        {
          ticket_id: t.ticket_id,
          user_id: assignedPicOmiId,
          assignment_type: 'Active',
          status: 'Pending',
        },
        ...picOmiSSUsers.map((ss) => ({
          ticket_id: t.ticket_id,
          user_id: ss.user_id,
          assignment_type: 'Active',
          status: 'Pending',
        })),
      ];

      await tx.ticketAssignment.createMany({
        data: assignments,
        skipDuplicates: true,
      });

      return t;
    });

    if (picOmiUser?.email) {
      void sendTicketAssignedEmail({
        to: picOmiUser.email,
        subject: 'Request Pending Baru',
        ticket,
        extraText: 'Anda ditugaskan sebagai PIC untuk request ini.',
      }).catch((err) => {
        console.error('Gagal kirim email PIC OMI:', err);
      });
    }

    return NextResponse.json(
      {
        message: 'Sukses',
        ticket: serialize(ticket),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Gagal submit tiket:', error);

    return NextResponse.json({ message: 'Error server.' }, { status: 500 });
  }
}