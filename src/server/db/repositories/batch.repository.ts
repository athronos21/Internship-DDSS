import { db } from '../../db.js';
import type { MedicineBatch } from '../types.js';

export const BatchRepository = {
  getBatchesWithStatus(): MedicineBatch[] {
    return db.getBatchesWithStatus();
  },

  findByMedicineId(medicineId: string): MedicineBatch[] {
    return db.getBatchesWithStatus().filter((b) => b.medicineId === medicineId);
  },

  findById(id: string): MedicineBatch | undefined {
    return db.getBatchesWithStatus().find((b) => b.id === id);
  },

  allocateFefoStock(medicineId: string, quantityNeeded: number) {
    return db.allocateFefoStock(medicineId, quantityNeeded);
  },

  create(batchData: any): MedicineBatch {
    const now = new Date().toISOString();
    const newBatch: MedicineBatch = {
      id: batchData.id || `bat-${Date.now()}`,
      medicineId: batchData.medicineId,
      batchNumber: batchData.batchNumber,
      manufacturingDate: batchData.manufacturingDate || batchData.mfgDate || '2025-01-01',
      expiryDate: batchData.expiryDate || batchData.expDate || '2028-01-01',
      purchasePrice: Number(batchData.purchasePrice) || 10,
      sellingPrice: Number(batchData.sellingPrice) || 20,
      initialQuantity: Number(batchData.quantity || batchData.initialQuantity || 0),
      currentQuantity: Number(batchData.quantity || batchData.currentQuantity || 0),
      supplierId: batchData.supplierId || 'sup-1',
      createdAt: now,
      updatedAt: now,
    };
    db.medicineBatches.push(newBatch);
    return newBatch;
  },
};
