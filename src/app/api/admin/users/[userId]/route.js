import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';

// ================================
// UPDATE USER (ADMIN)
// ================================
export async function PUT(request, { params }) {
  const { userId } = await params;
  const id = parseInt(userId, 10);

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'Administrator') {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'User ID tidak valid' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      name,
      username,
      email,
      phone,
      password,
      role_id,
      division_id,
      pic_omi_id,
      status
    } = body;

    if (!name || !username || !role_id) {
      return NextResponse.json(
        { message: 'Nama, username, dan role wajib diisi' },
        { status: 400 }
      );
    }

    // ================================
    // VALIDASI KHUSUS ROLE PIC OMI
    // ================================
    const role = await prisma.role.findUnique({
      where: { role_id: parseInt(role_id, 10) },
    });

    if (!role) {
      return NextResponse.json(
        { message: 'Role tidak ditemukan' },
        { status: 400 }
      );
    }

    // PIC OMI biasa → wajib punya division
    if (role.role_name === 'PIC OMI' && !division_id) {
      return NextResponse.json(
        { message: 'PIC OMI wajib memiliki divisi' },
        { status: 400 }
      );
    }

    // PIC OMI SS → TIDAK BOLEH punya division
    if (role.role_name === 'PIC OMI (SS)' && division_id) {
      return NextResponse.json(
        { message: 'PIC OMI (SS) tidak boleh memiliki divisi' },
        { status: 400 }
      );
    }

    const dataToUpdate = {
      name,
      username,
      email: email || null,
      phone: phone || null,
      role_id: parseInt(role_id, 10),
      division_id:
        role.role_name === 'PIC OMI (SS)'
          ? null
          : division_id
          ? parseInt(division_id, 10)
          : null,
      pic_omi_id: pic_omi_id ? parseInt(pic_omi_id, 10) : null,
      ...(status && { status })
    };

    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { user_id: id },
      data: dataToUpdate,
      omit: { password: true },
      include: {
        role: true,
        division: true,
        picOmi: { select: { name: true } }
      }
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Username atau email sudah digunakan' },
        { status: 400 }
      );
    }

    console.error('Gagal update user:', error);
    return NextResponse.json(
      { message: 'Gagal update user' },
      { status: 500 }
    );
  }
}

// ================================
// DELETE - Soft delete (nonaktifkan user)
// ================================
export async function DELETE(request, { params }) {
  const { userId } = await params;
  const id = parseInt(userId, 10);

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'Administrator') {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  if (isNaN(id)) {
    return NextResponse.json({ message: 'User ID tidak valid' }, { status: 400 });
  }

  if (id === Number(session.user.id)) {
    return NextResponse.json(
      { message: 'Anda tidak dapat menonaktifkan akun sendiri.' },
      { status: 400 }
    );
  }

  try {
    await prisma.user.update({
      where: { user_id: id },
      data: { status: 'Inactive' },
    });

    return NextResponse.json({ message: 'User berhasil dinonaktifkan.' });
  } catch (error) {
    console.error('Gagal menonaktifkan user:', error);
    return NextResponse.json(
      { message: 'Gagal menonaktifkan user', error: error.message },
      { status: 500 }
    );
  }
}
