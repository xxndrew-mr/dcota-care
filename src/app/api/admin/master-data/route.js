import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'Administrator') {
    return NextResponse.json(
      { message: 'Anda tidak diizinkan.' },
      { status: 403 }
    );
  }

  try {
    const roles = await prisma.role.findMany();
    const divisions = await prisma.division.findMany();

    return NextResponse.json({ roles, divisions });
  } catch (error) {
    console.error('Gagal mengambil master data:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}