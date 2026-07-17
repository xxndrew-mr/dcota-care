import { describe, it, expect } from 'vitest';
import { serialize } from '@/lib/serialize';

describe('serialize', () => {
  it('mengonversi BigInt menjadi string', () => {
    expect(serialize({ ticket_id: 123n })).toEqual({ ticket_id: '123' });
  });

  it('menangani BigInt bersarang di objek dan array', () => {
    const input = {
      ticket: { ticket_id: 9007199254740993n },
      logs: [{ log_id: 1n }, { log_id: 2n }],
    };
    expect(serialize(input)).toEqual({
      ticket: { ticket_id: '9007199254740993' },
      logs: [{ log_id: '1' }, { log_id: '2' }],
    });
  });

  it('membiarkan tipe lain apa adanya', () => {
    const input = {
      title: 'Tiket',
      count: 42,
      active: true,
      empty: null,
    };
    expect(serialize(input)).toEqual(input);
  });

  it('mengonversi Date menjadi string ISO (perilaku JSON.stringify)', () => {
    const result = serialize({ createdAt: new Date('2026-07-16T00:00:00Z') });
    expect(result.createdAt).toBe('2026-07-16T00:00:00.000Z');
  });

  it('menangani array di level teratas', () => {
    expect(serialize([{ id: 5n }])).toEqual([{ id: '5' }]);
  });
});
