// ETL manual ke BigQuery — versi CLI dari /api/cron/sync-bigquery.
// Skema, kredensial (env GCP_*), dan cara load (WRITE_TRUNCATE) sengaja
// disamakan dengan cron route agar keduanya tidak saling merusak tabel.
const { BigQuery } = require('@google-cloud/bigquery');
const { PrismaClient } = require('@prisma/client');
const { writeFile, unlink } = require('fs/promises');
const { tmpdir } = require('os');
const { join } = require('path');

// Muat .env bila dijalankan langsung via `node scripts/etl-to-bigquery.js`
try {
  process.loadEnvFile();
} catch {
  // .env tidak ada — andalkan env dari shell
}

const prisma = new PrismaClient();

// Dataset khusus Dcota Care — terpisah dari 'helpdesk_data' milik Onda Care.
const DATASET_ID = 'dcota_care';
const TABLE_ID = 'tickets_analytics';

const TABLE_SCHEMA = [
  { name: 'ticket_id', type: 'STRING' },
  { name: 'title', type: 'STRING' },
  { name: 'description', type: 'STRING' },
  { name: 'notes', type: 'STRING' },
  { name: 'kode_sales', type: 'STRING' },
  { name: 'submitted_by', type: 'STRING' },
  { name: 'type', type: 'STRING' },
  { name: 'status', type: 'STRING' },
  { name: 'created_at', type: 'TIMESTAMP' },
  { name: 'updated_at', type: 'TIMESTAMP' },
  { name: 'kategori', type: 'STRING' },
  { name: 'nama_pengisi', type: 'STRING' },
  { name: 'toko', type: 'STRING' },
];

async function syncTickets() {
  console.log('--- Mulai Sinkronisasi Tiket ---');

  if (!process.env.GCP_PROJECT_ID || !process.env.GCP_CLIENT_EMAIL || !process.env.GCP_PRIVATE_KEY) {
    throw new Error('GCP_PROJECT_ID / GCP_CLIENT_EMAIL / GCP_PRIVATE_KEY belum diset di env (lihat .env.example).');
  }

  const bigquery = new BigQuery({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: {
      client_email: process.env.GCP_CLIENT_EMAIL,
      private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
  });

  const dataset = bigquery.dataset(DATASET_ID);
  const [datasetExists] = await dataset.exists();
  if (!datasetExists) {
    console.log(`Dataset '${DATASET_ID}' tidak ada. Membuat dataset...`);
    await dataset.create();
  }

  const table = dataset.table(TABLE_ID);
  const [tableExists] = await table.exists();
  if (!tableExists) {
    console.log(`Membuat tabel ${TABLE_ID} di BigQuery...`);
    await dataset.createTable(TABLE_ID, { schema: TABLE_SCHEMA });
  }

  const tickets = await prisma.ticket.findMany({
    include: {
      submittedBy: { select: { name: true, username: true } },
      detail: true,
      logs: { orderBy: { timestamp: 'desc' }, take: 1 },
    },
  });

  console.log(`Total tiket dari DB: ${tickets.length}`);
  if (!tickets.length) {
    console.log('Tidak ada tiket untuk disinkronisasi.');
    return;
  }

  const rows = tickets.map((t) => ({
    ticket_id: String(t.ticket_id),
    title: t.title ? String(t.title) : '(No Title)',
    description: t.detail?.description ? String(t.detail.description) : '(No Description)',
    notes: t.logs?.[0]?.notes ? String(t.logs[0].notes) : null,
    submitted_by: t.submittedBy?.name ? String(t.submittedBy.name) : 'Unknown',
    kode_sales: t.submittedBy?.username ? String(t.submittedBy.username) : 'Unknown',
    type: t.type ? String(t.type) : 'Pending',
    status: t.status ? String(t.status) : 'Open',
    created_at: (t.createdAt ? new Date(t.createdAt) : new Date()).toISOString(),
    updated_at: (t.updatedAt ? new Date(t.updatedAt) : new Date()).toISOString(),
    kategori: t.kategori ? String(t.kategori) : '(No Category)',
    nama_pengisi: t.nama_pengisi ? String(t.nama_pengisi) : 'Unknown',
    toko: t.toko ? String(t.toko) : 'Unknown',
  }));

  // Load job WRITE_TRUNCATE: isi tabel diganti penuh, bebas duplikat.
  const tempFilePath = join(tmpdir(), `tickets-analytics-${Date.now()}.jsonl`);
  try {
    await writeFile(tempFilePath, rows.map((row) => JSON.stringify(row)).join('\n'));
    await table.load(tempFilePath, {
      sourceFormat: 'NEWLINE_DELIMITED_JSON',
      writeDisposition: 'WRITE_TRUNCATE',
      ignoreUnknownValues: true,
    });
    console.log(`Berhasil memuat ${rows.length} baris ke ${DATASET_ID}.${TABLE_ID}.`);
  } finally {
    await unlink(tempFilePath).catch(() => {});
  }
}

async function main() {
  try {
    await syncTickets();
  } catch (err) {
    console.error('ETL Error:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
