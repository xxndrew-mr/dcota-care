import { describe, it, expect, beforeAll } from 'vitest';
import { createUploadToken, verifyUploadToken } from '@/lib/uploadToken';

beforeAll(() => {
  process.env.UPLOAD_SIGNING_SECRET = 'test-secret-untuk-vitest';
});

describe('uploadToken', () => {
  it('token yang baru dibuat lolos verifikasi', () => {
    const token = createUploadToken();
    expect(verifyUploadToken(token)).toBe(true);
  });

  it('menolak token kedaluwarsa', () => {
    const now = 1_000_000;
    const token = createUploadToken(now);
    // 121 detik kemudian (TTL 120s) → kedaluwarsa
    expect(verifyUploadToken(token, now + 121)).toBe(false);
  });

  it('menolak token dengan tanda tangan yang diubah', () => {
    const token = createUploadToken();
    const [exp, sig] = token.split('.');
    const tampered = `${exp}.${sig.slice(0, -1)}${sig.endsWith('a') ? 'b' : 'a'}`;
    expect(verifyUploadToken(tampered)).toBe(false);
  });

  it('menolak exp yang dipalsukan (tanda tangan tidak cocok)', () => {
    const token = createUploadToken();
    const [, sig] = token.split('.');
    const future = Math.floor(Date.now() / 1000) + 999999;
    expect(verifyUploadToken(`${future}.${sig}`)).toBe(false);
  });

  it('menolak format token yang tidak valid', () => {
    expect(verifyUploadToken('')).toBe(false);
    expect(verifyUploadToken('tanpatitik')).toBe(false);
    expect(verifyUploadToken(null)).toBe(false);
    expect(verifyUploadToken(undefined)).toBe(false);
  });
});
