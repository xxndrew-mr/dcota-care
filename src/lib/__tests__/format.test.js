import { describe, it, expect } from 'vitest';
import { formatDate, getMonthKey, getMonthLabel } from '@/lib/format';

// Tanggal tengah bulan pukul 12:00 UTC agar hasil stabil di timezone mana pun.
const MID_JULY = '2026-07-15T12:00:00Z';

describe('formatDate', () => {
  it("mengembalikan '-' untuk input kosong", () => {
    expect(formatDate(null)).toBe('-');
    expect(formatDate(undefined)).toBe('-');
    expect(formatDate('')).toBe('-');
  });

  it('memformat tanggal dalam locale id-ID', () => {
    const result = formatDate(MID_JULY);
    expect(result).toContain('Jul');
    expect(result).toContain('2026');
  });
});

describe('getMonthKey', () => {
  it('mengembalikan null untuk input kosong', () => {
    expect(getMonthKey(null)).toBeNull();
    expect(getMonthKey('')).toBeNull();
  });

  it('mengembalikan key YYYY-MM dengan bulan dua digit', () => {
    expect(getMonthKey(MID_JULY)).toBe('2026-07');
    expect(getMonthKey('2026-11-15T12:00:00Z')).toBe('2026-11');
  });
});

describe('getMonthLabel', () => {
  it("mengembalikan '-' untuk input kosong", () => {
    expect(getMonthLabel(null)).toBe('-');
  });

  it('mengembalikan nama bulan Indonesia + tahun', () => {
    expect(getMonthLabel(MID_JULY)).toBe('Juli 2026');
  });
});
