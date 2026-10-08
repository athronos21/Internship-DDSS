import { expect, test, describe } from 'bun:test';
import { MedicineRepository } from '../src/server/db/repositories/medicine.repository';
import { BatchRepository } from '../src/server/db/repositories/batch.repository';
import { SalesRepository } from '../src/server/db/repositories/sales.repository';
import { InventoryRepository } from '../src/server/db/repositories/inventory.repository';

describe('Domain Repositories & Data Access Layer (Task 2)', () => {
  test('MedicineRepository lists and calculates stock correctly', () => {
    const meds = MedicineRepository.list();
    expect(Array.isArray(meds)).toBe(true);
    expect(meds.length).toBeGreaterThan(0);
    const first = meds[0];
    expect(first.id).toBeDefined();
    expect(first.name).toBeDefined();
    expect(typeof first.totalStock).toBe('number');
  });

  test('MedicineRepository can find a medicine by barcode or SKU', () => {
    const meds = MedicineRepository.list();
    const target = meds[0];
    const foundByBarcode = MedicineRepository.findByBarcode(target.barcode);
    expect(foundByBarcode).toBeDefined();
    expect(foundByBarcode?.id).toBe(target.id);
  });

  test('BatchRepository allocates batches and calculates expiry status', () => {
    const batches = BatchRepository.getBatchesWithStatus();
    expect(Array.isArray(batches)).toBe(true);
    expect(batches.length).toBeGreaterThan(0);
    const first = batches[0];
    expect(first.batchNumber).toBeDefined();
    expect(['ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'OUT_OF_STOCK']).toContain(first.status!);
  });

  test('InventoryRepository logs physical adjustments', () => {
    const meds = MedicineRepository.list();
    const targetMed = meds[0];
    const res = InventoryRepository.adjustStock({
      medicineId: targetMed.id,
      countedQuantity: 150,
      reason: 'Physical recount verification test',
      performedBy: 'u-1',
    });
    expect(res.success).toBe(true);
  });
});
