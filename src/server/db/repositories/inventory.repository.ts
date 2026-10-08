import { db } from '../../db.js';
import type { InventoryTransaction } from '../types.js';

export const InventoryRepository = {
  getTransactions(limit = 100): InventoryTransaction[] {
    return db.inventoryTransactions.slice(0, limit);
  },

  logTransaction(txData: any): InventoryTransaction {
    const tx: InventoryTransaction = {
      id: txData.id || `tx-${Date.now()}`,
      medicineId: txData.medicineId,
      medicineName: txData.medicineName || 'Medicine',
      batchId: txData.batchId,
      batchNumber: txData.batchNumber,
      transactionType: txData.transactionType || 'ADJUSTMENT',
      quantity: txData.quantity,
      previousQuantity: txData.previousQuantity || 0,
      newQuantity: txData.newQuantity || 0,
      performedBy: txData.performedBy || 'u-1',
      reason: txData.reason || txData.notes,
      createdAt: new Date().toISOString(),
    };
    db.inventoryTransactions.unshift(tx);
    return tx;
  },

  adjustStock(params: {
    medicineId: string;
    batchId?: string;
    countedQuantity?: number;
    quantityDelta?: number;
    transactionType?: 'ADJUSTMENT' | 'DAMAGED' | 'EXPIRED';
    reason: string;
    performedBy: string;
  }): { success: boolean; message: string; transaction?: InventoryTransaction } {
    try {
      let targetBatchId = params.batchId;
      if (!targetBatchId) {
        const batch = db.medicineBatches.find((b) => b.medicineId === params.medicineId);
        if (!batch) {
          return { success: false, message: 'No batch found for this medicine' };
        }
        targetBatchId = batch.id;
      }

      const targetBatch = db.medicineBatches.find((b) => b.id === targetBatchId);
      if (!targetBatch) {
        return { success: false, message: 'Target batch not found' };
      }

      let delta = params.quantityDelta;
      if (delta === undefined && params.countedQuantity !== undefined) {
        delta = params.countedQuantity - targetBatch.currentQuantity;
      }
      if (delta === undefined) {
        delta = 0;
      }

      const tx = db.adjustStock({
        medicineId: params.medicineId,
        batchId: targetBatchId,
        transactionType: params.transactionType || 'ADJUSTMENT',
        quantityDelta: delta,
        notes: params.reason,
        performedByUserId: params.performedBy,
      });
      return { success: true, message: 'Stock adjusted successfully', transaction: tx as any };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },
};
