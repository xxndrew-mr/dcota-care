import { describe, it, expect } from 'vitest';
import { getRoutingTarget, routingMap } from '@/lib/smartRouting';

describe('getRoutingTarget', () => {
  it('mengembalikan divisi AM & AP untuk setiap kategori terdaftar', () => {
    for (const kategori of Object.keys(routingMap)) {
      const target = getRoutingTarget(kategori);
      expect(target).not.toBeNull();
      expect(target.am_division).toBeTruthy();
      expect(target.ap_division).toBeTruthy();
    }
  });

  it('tidak case-sensitive terhadap input kategori', () => {
    expect(getRoutingTarget('produk')).toEqual(getRoutingTarget('PRODUK'));
    expect(getRoutingTarget('Tools Penjualan')).toEqual(
      getRoutingTarget('TOOLS PENJUALAN')
    );
  });

  it('me-routing PRODUK ke Divisi Operation (AM) dan Divisi Prodev (AP)', () => {
    expect(getRoutingTarget('PRODUK')).toEqual({
      am_division: 'Divisi Operation',
      ap_division: 'Divisi Prodev',
    });
  });

  it('mengembalikan null untuk kategori tidak dikenal atau kosong', () => {
    expect(getRoutingTarget('TIDAK ADA')).toBeNull();
    expect(getRoutingTarget('')).toBeNull();
    expect(getRoutingTarget(null)).toBeNull();
    expect(getRoutingTarget(undefined)).toBeNull();
  });
});
