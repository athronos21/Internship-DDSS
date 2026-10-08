import { db } from '../../db.js';
import type { Supplier, PurchaseOrder } from '../types.js';

export const PurchaseRepository = {
  listSuppliers(): Supplier[] {
    return db.suppliers;
  },

  findSupplierById(id: string): Supplier | undefined {
    return db.suppliers.find((s) => s.id === id);
  },

  createSupplier(data: any): Supplier {
    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      name: data.name,
      contactPerson: data.contactPerson || '',
      phone: data.phone || '',
      email: data.email || '',
      tinNumber: data.tinNumber,
      address: data.address || '',
      creditLimit: Number(data.creditLimit) || 0,
      paymentTerms: data.paymentTerms || 'Net 30',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    db.suppliers.push(newSup);
    return newSup;
  },

  listPurchases() {
    return db.purchases;
  },

  createPurchaseOrder(data: any) {
    return db.createPurchaseOrder(data);
  },
};
