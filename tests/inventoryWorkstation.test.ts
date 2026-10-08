import { describe, it, expect } from 'bun:test';
import { User } from '../src/types';

describe('InventorySystemWorkstation Architecture & Subsystems', () => {
  const storeOwner: User = {
    id: 'u-1',
    name: 'Dr. Alemu Tadesse',
    email: 'admin@kaziniya.com',
    role: 'STORE_OWNER',
    isOwner: true,
    isActive: true,
    createdAt: '2026-01-01',
  };

  const pharmacist: User = {
    id: 'u-munaa',
    name: 'Muna Ahmed',
    email: 'munaa7536@gmail.com',
    role: 'PHARMACIST',
    isOwner: false,
    isActive: true,
    createdAt: '2026-01-01',
  };

  it('exposes the 6 dedicated IMS subsystem tabs', async () => {
    const { IMS_SUBSYSTEMS } = await import('../src/components/inventory/InventorySystemWorkstation');
    expect(IMS_SUBSYSTEMS).toBeDefined();
    expect(IMS_SUBSYSTEMS.length).toBe(6);
    expect(IMS_SUBSYSTEMS.some((s) => s.id === 'medicines')).toBe(true);
    expect(IMS_SUBSYSTEMS.some((s) => s.id === 'batches')).toBe(true);
    expect(IMS_SUBSYSTEMS.some((s) => s.id === 'adjustments')).toBe(true);
    expect(IMS_SUBSYSTEMS.some((s) => s.id === 'requests')).toBe(true);
    expect(IMS_SUBSYSTEMS.some((s) => s.id === 'movements')).toBe(true);
    expect(IMS_SUBSYSTEMS.some((s) => s.id === 'forecast')).toBe(true);
  });

  it('provides quick action toolbelt actions', async () => {
    const { IMS_TOOLBELT_ACTIONS } = await import('../src/components/inventory/InventorySystemWorkstation');
    expect(IMS_TOOLBELT_ACTIONS).toBeDefined();
    expect(IMS_TOOLBELT_ACTIONS.some((a) => a.id === 'scan')).toBe(true);
    expect(IMS_TOOLBELT_ACTIONS.some((a) => a.id === 'barcode')).toBe(true);
    expect(IMS_TOOLBELT_ACTIONS.some((a) => a.id === 'import_csv')).toBe(true);
    expect(IMS_TOOLBELT_ACTIONS.some((a) => a.id === 'add_medicine')).toBe(true);
  });
});
