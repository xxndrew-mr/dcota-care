import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 401 });
  }

  // === DINONAKTIFKAN ATAS PERMINTAAN DIREKSI ===
  // Fitur ganti password dimatikan khusus untuk akun Salesman.
  // Logika di bawah sengaja TIDAK dihapus — hapus blok ini untuk mengaktifkan kembali.
  if (session.user.role === 'Salesman') {
    return NextResponse.json(
      { message: 'Fitur ganti password dinonaktifkan untuk akun Salesman.' },
      { status: 403 }
    );
  }
  // === END NONAKTIF ===

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: 'Semua field wajib diisi' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ message: 'Password baru minimal 8 karakter' }, { status: 400 });
    }

    // Ambil user dari database untuk mendapatkan password hash saat ini
    const user = await prisma.user.findUnique({
      where: { user_id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });
    }

    // Verifikasi password lama
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Password lama salah' }, { status: 400 });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password di database
    await prisma.user.update({
      where: { user_id: session.user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: 'Password berhasil diubah' }, { status: 200 });

  } catch (error) {
    console.error('Gagal ganti password:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}