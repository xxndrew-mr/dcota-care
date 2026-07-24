// Reset massal password user (permintaan manajemen).
//
// Default: SEMUA user (termasuk Administrator). Default AMAN: dry-run —
// hanya menampilkan siapa yang terdampak; tidak ada yang berubah tanpa --apply.
//
// Contoh pemakaian:
//   node scripts/reset-passwords.js --password dcotacare123          # dry-run, semua user
//   node scripts/reset-passwords.js --password dcotacare123 --apply  # eksekusi, semua user
//   node scripts/reset-passwords.js --password xxx --role Salesman --apply  # hanya role tertentu
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Muat .env bila dijalankan langsung dari terminal
try {
  process.loadEnvFile();
} catch {
  // .env tidak ada — andalkan env dari shell
}

const prisma = new PrismaClient();

function parseArgs(argv) {
  const args = { roles: [], apply: false, password: null };
  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--apply':
        args.apply = true;
        break;
      case '--role':
        args.roles.push(argv[++i]);
        break;
      case '--password':
        args.password = argv[++i];
        break;
      default:
        console.error(`Argumen tidak dikenal: ${argv[i]}`);
        process.exit(1);
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const password = args.password || process.env.NEW_PASSWORD;

  if (!password) {
    console.error('Password baru wajib diisi: --password <password> atau env NEW_PASSWORD.');
    process.exit(1);
  }
  if (password.length < 6) {
    console.error('Password baru minimal 6 karakter.');
    process.exit(1);
  }

  const where =
    args.roles.length > 0 ? { role: { role_name: { in: args.roles } } } : {};

  const targets = await prisma.user.findMany({
    where,
    select: {
      user_id: true,
      username: true,
      status: true,
      role: { select: { role_name: true } },
    },
    orderBy: { user_id: 'asc' },
  });

  const scopeLabel =
    args.roles.length > 0
      ? `role: ${args.roles.join(', ')}`
      : 'SEMUA USER (termasuk Administrator)';
  console.log(`Cakupan  : ${scopeLabel}`);
  console.log(`Terdampak: ${targets.length} akun`);

  if (targets.length === 0) {
    console.log('Tidak ada akun yang cocok. Selesai.');
    return;
  }

  const perRole = {};
  for (const u of targets) {
    const r = u.role?.role_name || '(tanpa role)';
    perRole[r] = (perRole[r] || 0) + 1;
  }
  for (const [r, n] of Object.entries(perRole)) console.log(`  - ${r}: ${n}`);

  const sample = targets.slice(0, 5).map((u) => u.username).join(', ');
  console.log(`Contoh   : ${sample}${targets.length > 5 ? ', ...' : ''}`);

  if (!args.apply) {
    console.log('\nDRY-RUN — tidak ada yang diubah. Tambahkan --apply untuk mengeksekusi.');
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const result = await prisma.user.updateMany({
    where,
    data: { password: hashed },
  });

  console.log(`\nSelesai: password ${result.count} akun berhasil diganti.`);
}

main()
  .catch((err) => {
    console.error('Gagal reset password:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
