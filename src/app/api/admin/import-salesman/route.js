import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { parse } from 'csv-parse/sync';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'Administrator') {
      return NextResponse.json(
        { message: 'Tidak diizinkan' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { message: 'File tidak ditemukan' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const csvText = buffer.toString();

    const rows = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    });

    if (!rows.length) {
      return NextResponse.json(
        { message: 'File kosong' },
        { status: 400 }
      );
    }

    const salesmanRole = await prisma.role.findFirst({
      where: { role_name: 'Salesman' },
    });

    if (!salesmanRole) {
      return NextResponse.json(
        { message: 'Role Salesman tidak ditemukan' },
        { status: 400 }
      );
    }

    const divisions = await prisma.division.findMany();
    const picOmis = await prisma.user.findMany({
      where: {
        role: {
          role_name: { in: ['PIC OMI', 'PIC OMI (SS)'] },
        },
      },
    });

    // Password awal seluruh salesman hasil import — dikonfigurasi via env
    // (fitur ganti password Salesman dinonaktifkan, jadi nilai ini permanen
    // sampai kebijakan berubah).
    const defaultPassword = await bcrypt.hash(
      process.env.IMPORT_DEFAULT_PASSWORD || '123456',
      10
    );

    const usersToInsert = [];

    for (const row of rows) {
      if (!row.name || !row.username) continue;

      const division = divisions.find(
        (d) =>
          d.division_name.toLowerCase().trim() ===
          row.division_name?.toLowerCase().trim()
      );

      const picOmi = picOmis.find(
        (p) =>
          p.name.toLowerCase().trim() ===
          row.pic_omi_name?.toLowerCase().trim()
      );

      if (!division || !picOmi) continue;

      usersToInsert.push({
        name: row.name.trim(),
        username: row.username.trim(),
        phone: row.phone?.trim() || null,
        password: defaultPassword,
        role_id: salesmanRole.role_id,
        division_id: division.division_id,
        pic_omi_id: picOmi.user_id,
        status: 'Active',
      });
    }

    if (!usersToInsert.length) {
      return NextResponse.json(
        { message: 'Tidak ada data valid untuk diimport' },
        { status: 400 }
      );
    }

    const created = await prisma.user.createMany({
      data: usersToInsert,
      skipDuplicates: true,
    });

    return NextResponse.json({
      message: 'Import berhasil',
      inserted: created.count,
      duplicate: usersToInsert.length - created.count,
      invalid: rows.length - usersToInsert.length,
    });

  } catch (error) {
    console.error('IMPORT ERROR:', error);

    return NextResponse.json(
      { message: 'Gagal import' },
      { status: 500 }
    );
  }
}
