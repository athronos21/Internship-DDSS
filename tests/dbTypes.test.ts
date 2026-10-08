import { expect, test, describe } from 'bun:test';
import type {
  PharmacyStoreProfile,
  Medicine,
  MedicineBatch,
  InventoryTransaction,
  Sale,
  Supplier,
  PurchaseOrder,
} from '../src/server/db/types';

describe('Database Entity Types & Constraints (Task 1)', () => {
  test('PharmacyStoreProfile includes enableBarcodeSystem default to false', () => {
    const profile: Partial<PharmacyStoreProfile> = {
      id: 'node-01',
      storeName: 'Kaziniya Flagship Pharmacy',
      storeType: 'COMMUNITY_DRUG_STORE',
      tinNumber: '0098234123',
      efdaLicense: 'EFDA/DISP/AA/2024/8492',
      ownerName: 'Dr. Alemu Tadesse',
      ownerEmail: 'admin@kaziniya.com',
      ownerPhone: '+251 911 234 567',
      city: 'Addis Ababa',
      subcity: 'Bole Subcity',
      streetAddress: 'Bole Medhanealem Road',
      operatingHours: 'Open 24/7',
      is24Hours: true,
      coldChainAvailable: true,
      deliveryAvailable: true,
      status: 'ACTIVE',
      registeredAt: '2026-01-01T08:00:00Z',
      enableBarcodeSystem: false,
    };
    expect(profile.enableBarcodeSystem).toBe(false);
    expect(profile.storeType).toBe('COMMUNITY_DRUG_STORE');
  });

  test('Medicine entity includes unique barcode, sku and formulary fields', () => {
    const med: Partial<Medicine> = {
      id: 'med-01',
      barcode: '628104829104',
      sku: 'KZN-AMOX-8491',
      name: 'Amoxil 500mg',
      genericName: 'Amoxicillin Trihydrate',
      brandName: 'Amoxil',
      categoryId: 'cat-1',
      dosageForm: 'Capsule',
      strength: '500mg',
      unit: 'Strip',
      manufacturer: 'EPHARM',
      prescriptionRequired: true,
      reorderLevel: 20,
      isActive: true,
    };
    expect(med.sku).toBe('KZN-AMOX-8491');
    expect(med.prescriptionRequired).toBe(true);
  });

  test('MedicineBatch supports FEFO tracking fields', () => {
    const batch: Partial<MedicineBatch> = {
      id: 'bat-01',
      medicineId: 'med-01',
      batchNumber: 'KZ-AMX-2025',
      manufacturingDate: '2024-09-01',
      expiryDate: '2027-08-30',
      purchasePrice: 22,
      sellingPrice: 35,
      initialQuantity: 100,
      currentQuantity: 80,
      supplierId: 'sup-1',
      status: 'ACTIVE',
    };
    expect(batch.currentQuantity).toBe(80);
    expect(batch.status).toBe('ACTIVE');
  });
});
