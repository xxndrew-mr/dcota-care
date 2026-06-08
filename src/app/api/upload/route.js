import { NextResponse } from 'next/server';
import { s3Client } from '@/lib/r2';
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) return NextResponse.json({ message: 'File tidak ditemukan' }, { status: 400 });


    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name}`; // Buat nama unik

    await s3Client.send(
      new PutObjectCommand({
        Bucket: "dcota-care",
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })
    );

    // URL publik R2 (jika kamu sudah mengaktifkan Public Bucket atau Custom Domain)
    const fileUrl = `https://dcota.ondasystem.work/${fileName}`;

    return NextResponse.json({
      success: true,
      fileUrl: fileUrl,
    });

  } catch (err) {
    console.error('R2 Upload error:', err);
    return NextResponse.json({ message: 'Upload gagal' }, { status: 500 });
  }
}