import { describe, it, expect } from 'bun:test';
import { User } from '../src/types';

describe('WorkstationDropdown Configuration & Routing', () => {
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

  const superAdmin: User = {
    id: 'u-superadmin',
    name: 'Atronos Sisay',
    email: 'athronos21@gmail.com',
    role: 'SUPER_ADMIN',
    isSuperAdmin: true,
    isActive: true,
    createdAt: '2026-01-01',
  };

  it('exposes the standard workstation choices', async () => {
    const { WORKSTATION_ITEMS } = await import('../src/components/dashboard/WorkstationDropdown');
    expect(WORKSTATION_ITEMS).toBeDefined();
    expect(WORKSTATION_ITEMS.some((w) => w.id === 'IMS')).toBe(true);
    expect(WORKSTATION_ITEMS.some((w) => w.id === 'POS')).toBe(true);
    expect(WORKSTATION_ITEMS.some((w) => w.id === 'STORE_OPS')).toBe(true);
    expect(WORKSTATION_ITEMS.some((w) => w.id === 'MASTER_ADMIN')).toBe(true);
  });

  it('provides quick jump direct links for inventory sub-tasks', async () => {
    const { IMS_QUICK_JUMPS } = await import('../src/components/dashboard/WorkstationDropdown');
    expect(IMS_QUICK_JUMPS).toBeDefined();
    expect(IMS_QUICK_JUMPS.some((j) => j.tab === 'medicines')).toBe(true);
    expect(IMS_QUICK_JUMPS.some((j) => j.tab === 'batches')).toBe(true);
    expect(IMS_QUICK_JUMPS.some((j) => j.tab === 'adjustments')).toBe(true);
    expect(IMS_QUICK_JUMPS.some((j) => j.tab === 'requests')).toBe(true);
  });

  it('filters available workstations based on role permissions', async () => {
    const { getAvailableWorkstations } = await import('../src/components/dashboard/WorkstationDropdown');
    
    // Store Owner should see IMS, POS, STORE_OPS, but not MASTER_ADMIN
    const ownerOptions = getAvailableWorkstations(storeOwner);
    expect(ownerOptions.some((w) => w.id === 'IMS')).toBe(true);
    expect(ownerOptions.some((w) => w.id === 'POS')).toBe(true);
    expect(ownerOptions.some((w) => w.id === 'STORE_OPS')).toBe(true);
    expect(ownerOptions.some((w) => w.id === 'MASTER_ADMIN')).toBe(false);

    // Pharmacist should see IMS, POS, STORE_OPS, but not MASTER_ADMIN
    const pharmOptions = getAvailableWorkstations(pharmacist);
    expect(pharmOptions.some((w) => w.id === 'IMS')).toBe(true);
    expect(pharmOptions.some((w) => w.id === 'POS')).toBe(true);
    expect(pharmOptions.some((w) => w.id === 'MASTER_ADMIN')).toBe(false);

    // Super Admin should see all including MASTER_ADMIN
    const adminOptions = getAvailableWorkstations(superAdmin);
    expect(adminOptions.some((w) => w.id === 'MASTER_ADMIN')).toBe(true);
  });
});
