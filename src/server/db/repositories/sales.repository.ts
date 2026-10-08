import { db } from '../../db.js';
import type { Sale } from '../types.js';

export const SalesRepository = {
  list(limit = 100): Sale[] {
    return db.sales.slice(0, limit);
  },

  findById(id: string): Sale | undefined {
    return db.sales.find((s) => s.id === id || (s as any).invoiceNumber === id);
  },

  processSale(saleInput: any): Sale {
    return db.processSaleTransaction({
      items: saleInput.items,
      paymentMethod: saleInput.paymentMethod || 'CASH',
      customerName: saleInput.customerName,
      discount: saleInput.discount || 0,
      soldByUserId: saleInput.soldByUserId || saleInput.cashierId || 'u-1',
    });
  },

  getProfitReport() {
    return db.getProfitReport();
  },

  getDashboardSummary() {
    return db.getDashboardSummary();
  },
};
