import { describe, expect, it } from 'bun:test';
import { db } from '../src/server/db';

describe('Database Engine & Pharmacy Business Logic Suite', () => {
  it('retrieves calculated medicines with totalStock and sellingPrice', () => {
    const meds = db.getCalculatedMedicines();
    expect(Array.isArray(meds)).toBe(true);
    expect(meds.length).toBeGreaterThan(0);

    const first = meds[0];
    expect(first.id).toBeDefined();
    expect(first.name).toBeDefined();
    expect(typeof first.totalStock).toBe('number');
    expect(typeof first.sellingPrice).toBe('number');
  });

  it('retrieves batches enriched with expiry status', () => {
    const batches = db.getBatchesWithStatus();
    expect(Array.isArray(batches)).toBe(true);
    expect(batches.length).toBeGreaterThan(0);

    batches.forEach((b) => {
      expect(b.id).toBeDefined();
      expect(b.batchNumber).toBeDefined();
      expect(['ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'OUT_OF_STOCK']).toContain(b.status);
    });
  });

  describe('FEFO Stock Allocation (First-Expired, First-Out)', () => {
    it('allocates strictly from the earliest expiring available batch', () => {
      // Find a medicine with at least one active batch
      const meds = db.getCalculatedMedicines().filter((m) => (m.totalStock || 0) > 10);
      const targetMed = meds[0];
      expect(targetMed).toBeDefined();

      const batches = db.medicineBatches
        .filter((b) => b.medicineId === targetMed.id && b.currentQuantity > 0)
        .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));

      const allocation = db.allocateFefoStock(targetMed.id, 5);

      expect(allocation.medicineId).toBe(targetMed.id);
      expect(allocation.totalAllocated).toBe(5);
      expect(allocation.allocatedBatches.length).toBeGreaterThanOrEqual(1);

      // Earliest batch must match the first allocated batch
      expect(allocation.allocatedBatches[0].batchId).toBe(batches[0].id);
      expect(allocation.allocatedBatches[0].qtyDeducted).toBe(5);
    });

    it('splits allocation across multiple batches when requested quantity exceeds first batch', () => {
      // Find or inspect medicine with available batches
      const meds = db.getCalculatedMedicines().filter((m) => (m.totalStock || 0) > 20);
      const targetMed = meds[0];

      const availableBatches = db.medicineBatches
        .filter((b) => b.medicineId === targetMed.id && b.currentQuantity > 0)
        .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));

      if (availableBatches.length >= 2) {
        const firstBatchQty = availableBatches[0].currentQuantity;
        const requested = firstBatchQty + 5;

        const totalAvail = availableBatches.reduce((a, b) => a + b.currentQuantity, 0);
        if (totalAvail >= requested) {
          const allocation = db.allocateFefoStock(targetMed.id, requested);
          expect(allocation.allocatedBatches.length).toBeGreaterThanOrEqual(2);
          expect(allocation.allocatedBatches[0].qtyDeducted).toBe(firstBatchQty);
          expect(allocation.totalAllocated).toBe(requested);
        }
      }
    });

    it('throws error when requested stock exceeds non-expired availability', () => {
      const targetMed = db.medicines[0];
      const excessiveAmount = 9999999;

      expect(() => {
        db.allocateFefoStock(targetMed.id, excessiveAmount);
      }).toThrow(/Insufficient stock/);
    });

    it('throws error for non-existent medicine ID', () => {
      expect(() => {
        db.allocateFefoStock('med-non-existent-999', 5);
      }).toThrow(/not found/);
    });
  });

  describe('Sale Transaction Processing', () => {
    it('atomically executes sale, updates batch stock, writes transaction and audit logs', () => {
      const meds = db.getCalculatedMedicines().filter((m) => (m.totalStock || 0) >= 5);
      const targetMed = meds[0];

      const batchBefore = db.medicineBatches
        .filter((b) => b.medicineId === targetMed.id && b.currentQuantity > 0)
        .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate))[0];
      const initialQty = batchBefore.currentQuantity;

      const sale = db.processSaleTransaction({
        items: [
          {
            medicineId: targetMed.id,
            quantity: 2,
            unitPrice: 50,
          },
        ],
        paymentMethod: 'TELEBIRR',
        customerName: 'Abebe Bikila',
        discount: 5,
        soldByUserId: 'u-1',
      });

      expect(sale).toBeDefined();
      expect(sale.invoiceNumber).toMatch(/^KS-\d+/);
      expect(sale.paymentMethod).toBe('TELEBIRR');
      expect(sale.paymentStatus).toBe('PAID');
      expect(sale.totalAmount).toBe(2 * 50 - 5);
      expect(sale.items.length).toBe(1);

      // Verify stock was deducted from target batch
      const batchAfter = db.medicineBatches.find((b) => b.id === batchBefore.id);
      expect(batchAfter!.currentQuantity).toBe(initialQty - 2);

      // Verify inventory transaction was recorded
      const tx = db.inventoryTransactions[0];
      expect(tx.transactionType).toBe('SALE');
      expect(tx.medicineId).toBe(targetMed.id);
      expect(tx.quantity).toBe(-2);

      // Verify audit log was recorded
      const log = db.auditLogs[0];
      expect(log.action).toBe('SALE_COMPLETED');
      expect(log.entityType).toBe('SALE');
    });
  });

  describe('Stock Adjustments (Damage, Expiry, Physical Count)', () => {
    it('applies positive stock adjustments and records logs', () => {
      const batch = db.medicineBatches[0];
      const prevQty = batch.currentQuantity;

      const tx = db.adjustStock({
        medicineId: batch.medicineId,
        batchId: batch.id,
        transactionType: 'ADJUSTMENT',
        quantityDelta: 10,
        notes: 'Found in back store storage inventory audit',
        performedByUserId: 'u-1',
      });

      expect(tx).toBeDefined();
      expect(batch.currentQuantity).toBe(prevQty + 10);
      expect(tx.quantity).toBe(10);
      expect(tx.transactionType).toBe('ADJUSTMENT');
    });

    it('applies negative stock adjustments (Damaged) and prevents resulting in negative stock', () => {
      const batch = db.medicineBatches[0];
      const currentQty = batch.currentQuantity;

      const tx = db.adjustStock({
        medicineId: batch.medicineId,
        batchId: batch.id,
        transactionType: 'DAMAGED',
        quantityDelta: -2,
        notes: 'Vial broken during shelf stocking',
        performedByUserId: 'u-1',
      });

      expect(batch.currentQuantity).toBe(currentQty - 2);
      expect(tx.quantity).toBe(-2);

      // Attempting to deduct more than available must throw
      expect(() => {
        db.adjustStock({
          medicineId: batch.medicineId,
          batchId: batch.id,
          transactionType: 'DAMAGED',
          quantityDelta: -(batch.currentQuantity + 100),
          notes: 'Excessive deduction',
          performedByUserId: 'u-1',
        });
      }).toThrow(/negative stock/);
    });
  });

  describe('Purchase Orders & Restocking', () => {
    it('creates purchase order and replenishes existing batch or adds new batch', () => {
      const med = db.medicines[0];
      const supplier = db.suppliers[0];

      const purchase = db.createPurchaseOrder({
        supplierId: supplier.id,
        invoiceNumber: `PUR-TEST-${Date.now()}`,
        purchaseDate: new Date().toISOString().split('T')[0],
        createdByUserId: 'u-1',
        items: [
          {
            medicineId: med.id,
            batchNumber: `TEST-BN-${Date.now()}`,
            mfgDate: '2025-01-01',
            expDate: '2028-12-31',
            quantity: 100,
            unitCost: 15,
            sellingPrice: 25,
          },
        ],
      });

      expect(purchase).toBeDefined();
      expect(purchase.totalAmount).toBe(100 * 15);
      expect(purchase.status).toBe('COMPLETED');

      // Verify the new batch exists in medicineBatches
      const createdBatch = db.medicineBatches.find(
        (b) => b.batchNumber === purchase.items[0].batchNumber
      );
      expect(createdBatch).toBeDefined();
      expect(createdBatch!.currentQuantity).toBe(100);
      expect(createdBatch!.sellingPrice).toBe(25);
    });
  });

  describe('Dashboard Summary & Profit Reports', () => {
    it('generates consistent dashboard summary with sales trend and KPIs', () => {
      const summary = db.getDashboardSummary();
      expect(summary).toBeDefined();
      expect(typeof summary.todaySalesCount).toBe('number');
      expect(typeof summary.todayRevenue).toBe('number');
      expect(typeof summary.totalInventoryUnits).toBe('number');
      expect(typeof summary.totalInventoryValue).toBe('number');
      expect(Array.isArray(summary.salesTrend)).toBe(true);
      expect(summary.salesTrend.length).toBe(7);
      expect(Array.isArray(summary.topSellingMedicines)).toBe(true);
    });

    it('generates profit report with revenue, COGS, and profit margin', () => {
      const report = db.getProfitReport();
      expect(report).toBeDefined();
      expect(typeof report.totalRevenue).toBe('number');
      expect(typeof report.cogs).toBe('number');
      expect(typeof report.grossProfit).toBe('number');
      expect(typeof report.profitMarginPercent).toBe('number');
      expect(Array.isArray(report.breakdownByMedicine)).toBe(true);
    });
  });

  describe('Pharmacy Profile and Fleet Nodes', () => {
    it('reads and updates pharmacy store profile', () => {
      const current = db.getPharmacyProfile();
      expect(current.storeName).toBeDefined();

      const updated = db.updatePharmacyProfile({
        storeSlogan: 'Trusted Healthcare for Addis Ababa',
      });
      expect(updated.storeSlogan).toBe('Trusted Healthcare for Addis Ababa');
      expect(db.getPharmacyProfile().storeSlogan).toBe('Trusted Healthcare for Addis Ababa');
    });

    it('retrieves registered pharmacy nodes across Ethiopia', () => {
      const nodes = db.getRegisteredPharmacies();
      expect(Array.isArray(nodes)).toBe(true);
      expect(nodes.length).toBeGreaterThan(0);

      const first = nodes[0];
      expect(first.storeName).toBeDefined();
      expect(first.city).toBeDefined();
      expect(first.status).toBeDefined();
    });
  });
});
