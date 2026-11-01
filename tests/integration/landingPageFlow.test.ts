import { describe, test, expect } from 'bun:test';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

describe('Redesigned Professional Landing Page Suite', () => {
  const root = resolve(import.meta.dir, '..');

  test('1. Verifies PublicHome exists and contains complete Digital Drug Store info and dual registrations', () => {
    const publicHomePath = resolve(root, 'src/components/public/PublicHome.tsx');
    expect(existsSync(publicHomePath)).toBe(true);
    const content = readFileSync(publicHomePath, 'utf-8');

    // Platform Info & Pillars
    expect(content).toContain('Digital Drug Store');
    expect(content).toContain('DDS & PIMS');
    expect(content).toContain('FEFO Expiry Triage');
    expect(content).toContain('Cold-Chain IoT Vault');
    expect(content).toContain('EFDA Compliance');
    expect(content).toContain('EIMS Tax Engine');

    // Dual Registrations
    expect(content).toContain('Register Drug Store');
    expect(content).toContain('Register as Supplier');

    // Hero Wallpaper Showcase & Unified Login for all 4 roles
    expect(content).toContain('digital_pharma_hero_wallpaper.jpg');
    expect(content).toContain('Sign In for All Roles');
    expect(content).toContain('SUPER_ADMIN');
    expect(content).toContain('STORE_OWNER');
    expect(content).toContain('PHARMACIST');
    expect(content).toContain('SUPPLIER');
  });

  test('2. Verifies dynamic transformation into Registered Drug Store & Supplier landing pages', () => {
    const publicHomePath = resolve(root, 'src/components/public/PublicHome.tsx');
    const content = readFileSync(publicHomePath, 'utf-8');

    // Dynamic states
    expect(content).toContain("'REGISTERED_STORE'");
    expect(content).toContain("'REGISTERED_SUPPLIER'");
    expect(content).toContain('Create & Authorize Pharmacist Accounts');
    expect(content).toContain('Authorized Dispensary Staff Roster');
  });

  test('3. Verifies SupplierRegistrationModal component exists and captures wholesale details', () => {
    const supplierModalPath = resolve(root, 'src/components/public/SupplierRegistrationModal.tsx');
    expect(existsSync(supplierModalPath)).toBe(true);
    const content = readFileSync(supplierModalPath, 'utf-8');

    expect(content).toContain('Register as Pharmaceutical Supplier');
    expect(content).toContain('EFDA Wholesale License No.');
    expect(content).toContain('Warehouse Facility Address');
    expect(content).toContain('SUPPLY_CATEGORIES');
    expect(content).toContain('/api/suppliers');
  });

  test('4. Verifies PharmacistAuthorizationModal enables Store Owner to authorize dispensing staff', () => {
    const phModalPath = resolve(root, 'src/components/public/PharmacistAuthorizationModal.tsx');
    expect(existsSync(phModalPath)).toBe(true);
    const content = readFileSync(phModalPath, 'utf-8');

    expect(content).toContain('Authorize Pharmacist Account');
    expect(content).toContain('Dispensary Counter / Department Assignment');
    expect(content).toContain('POS 4-Digit Fast-Login PIN');
    expect(content).toContain("role: 'PHARMACIST'");
  });

  test('5. Verifies Header menubar provides direct universal accessibility for all platform features', () => {
    const headerPath = resolve(root, 'src/components/public/Header.tsx');
    expect(existsSync(headerPath)).toBe(true);
    const content = readFileSync(headerPath, 'utf-8');

    // 1. Info about DDS
    expect(content).toContain('About DDS');
    expect(content).toContain('dds-platform-info');

    // 2. 4-Role Login directly in Header menubar
    expect(content).toContain('4-Role Login');
    expect(content).toContain("'SUPER_ADMIN'");
    expect(content).toContain("'STORE_OWNER'");
    expect(content).toContain("'PHARMACIST'");
    expect(content).toContain("'SUPPLIER'");

    // 3. Dual Registrations and Pharmacist Authorization
    expect(content).toContain('Register & Onboard');
    expect(content).toContain('Register Drug Store');
    expect(content).toContain('Register as Supplier');
    expect(content).toContain('Authorize Pharmacist');

    // 4. Dynamic View Mode Switcher
    expect(content).toContain("'NATIONAL'");
    expect(content).toContain("'REGISTERED_STORE'");
    expect(content).toContain("'REGISTERED_SUPPLIER'");

    // 5. Storefront Core Links
    expect(content).toContain('Catalog');
    expect(content).toContain('Upload Rx');
    expect(content).toContain('Track Orders');
    expect(content).toContain('Branches');
    expect(content).toContain('Docs');
  });
});

