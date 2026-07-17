import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn', () => {
  it('menggabungkan beberapa class', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('mengabaikan nilai falsy', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b');
  });

  it('class Tailwind yang konflik dimenangkan oleh yang terakhir', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-slate-500', 'text-[#f26a21]')).toBe('text-[#f26a21]');
  });

  it('mendukung bentuk objek kondisional', () => {
    expect(cn('base', { aktif: true, mati: false })).toBe('base aktif');
  });
});
