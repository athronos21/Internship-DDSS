import { db } from '../../db.js';
import type { Medicine } from '../types.js';

export const MedicineRepository = {
  list(): Medicine[] {
    return db.getCalculatedMedicines();
  },

  findById(id: string): Medicine | undefined {
    return db.getCalculatedMedicines().find((m) => m.id === id);
  },

  findByBarcode(barcode: string): Medicine | undefined {
    const clean = (barcode || '').trim().toLowerCase();
    return db.getCalculatedMedicines().find(
      (m) => (m.barcode && m.barcode.toLowerCase() === clean) || (m.sku && m.sku.toLowerCase() === clean)
    );
  },

  findBySku(sku: string): Medicine | undefined {
    const clean = (sku || '').trim().toLowerCase();
    return db.getCalculatedMedicines().find((m) => m.sku && m.sku.toLowerCase() === clean);
  },

  create(medicineData: any): Medicine {
    const now = new Date().toISOString();
    const newMed: Medicine = {
      id: medicineData.id || `med-${Date.now()}`,
      barcode: medicineData.barcode || `6281${Math.floor(10000000 + Math.random() * 90000000)}`,
      sku: medicineData.sku || `MED-${(medicineData.name || 'MED').substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      name: medicineData.name,
      genericName: medicineData.genericName || medicineData.name,
      brandName: medicineData.brandName || medicineData.name,
      categoryId: medicineData.categoryId || 'cat-1',
      dosageForm: medicineData.dosageForm || 'Tablet',
      strength: medicineData.strength || '500mg',
      unit: medicineData.unit || 'Box',
      manufacturer: medicineData.manufacturer || 'Standard Pharma',
      description: medicineData.description || '',
      prescriptionRequired: !!medicineData.prescriptionRequired,
      reorderLevel: Number(medicineData.reorderLevel) || 20,
      shelfLocation: medicineData.shelfLocation || 'Shelf A-01',
      status: medicineData.status || 'Active',
      isActive: medicineData.status !== 'Inactive',
      createdAt: now,
      updatedAt: now,
    };
    db.medicines.push(newMed);
    return newMed;
  },

  update(id: string, updates: Partial<Medicine>): Medicine | null {
    const med = db.medicines.find((m) => m.id === id);
    if (!med) return null;
    Object.assign(med, updates, { updatedAt: new Date().toISOString() });
    return med;
  },

  delete(id: string, permanent = false): boolean {
    const idx = db.medicines.findIndex((m) => m.id === id);
    if (idx === -1) return false;

    if (permanent) {
      db.medicines.splice(idx, 1);
      for (let i = db.medicineBatches.length - 1; i >= 0; i--) {
        if (db.medicineBatches[i].medicineId === id) {
          db.medicineBatches.splice(i, 1);
        }
      }
    } else {
      db.medicines[idx].isActive = false;
      db.medicines[idx].updatedAt = new Date().toISOString();
    }
    return true;
  },

  restore(id: string): Medicine | null {
    const med = db.medicines.find((m) => m.id === id);
    if (!med) return null;
    med.isActive = true;
    med.updatedAt = new Date().toISOString();
    return med;
  },
};
