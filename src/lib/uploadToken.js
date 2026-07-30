import crypto from 'crypto';

// Token upload berumur pendek (HMAC-SHA256). Diterbitkan oleh route ber-sesi
// (/api/upload-token) dan diverifikasi oleh fungsi Go go-upload memakai secret
// yang sama — tanpa panggilan-balik HTTP antar-fungsi yang rapuh di serverless.
const TOKEN_TTL_SECONDS = 120;

function getSecret() {
  const secret = process.env.UPLOAD_SIGNING_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('UPLOAD_SIGNING_SECRET / NEXTAUTH_SECRET belum diset.');
  }
  return secret;
}

function sign(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

// Format token: "<exp-unix-seconds>.<hex-hmac>"
export function createUploadToken(nowSeconds = Math.floor(Date.now() / 1000)) {
  const exp = String(nowSeconds + TOKEN_TTL_SECONDS);
  return `${exp}.${sign(exp, getSecret())}`;
}

export function verifyUploadToken(token, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (typeof token !== 'string' || !token.includes('.')) return false;
  const [expStr, sig] = token.split('.');
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || nowSeconds > exp) return false;

  const expected = sign(expStr, getSecret());
  if (typeof sig !== 'string' || sig.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}
