import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createUploadToken } from '@/lib/uploadToken';

// Menerbitkan token upload berumur pendek untuk user yang sudah login.
// Fungsi Go go-upload memverifikasi token ini tanpa perlu memvalidasi sesi
// lagi lewat jaringan.
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Anda harus login' }, { status: 401 });
  }

  try {
    return NextResponse.json({ token: createUploadToken() });
  } catch (error) {
    console.error('Gagal membuat upload token:', error);
    return NextResponse.json(
      { message: 'Konfigurasi server belum lengkap.' },
      { status: 500 }
    );
  }
}
