import { Router } from 'express';
import { db } from '../db.js';
import { MedicineRepository } from '../db/repositories/medicine.repository.js';
import { BatchRepository } from '../db/repositories/batch.repository.js';
import { InventoryRepository } from '../db/repositories/inventory.repository.js';

export const inventoryRouter = Router();

// CATEGORIES API
inventoryRouter.get('/categories', (req, res) => {
  res.json({ success: true, data: db.categories });
});

inventoryRouter.post('/categories', (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Category Name is required' });

  const existing = db.categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
  if (existing) return res.status(400).json({ success: false, message: 'Category already exists' });

  const newCat = {
    id: `cat-${Date.now()}`,
    name,
    description: description || '',
    createdAt: new Date().toISOString(),
  };
  db.categories.push(newCat);
  res.status(201).json({ success: true, message: 'Category created successfully', data: newCat });
});

// MEDICINES API
inventoryRouter.get('/medicines', (req, res) => {
  try {
    const list = MedicineRepository.list();
    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

inventoryRouter.post('/medicines', (req, res) => {
  try {
    const {
      name,
      genericName,
      brandName,
      categoryId,
      dosageForm,
      strength,
      unit,
      manufacturer,
      description,
      prescriptionRequired,
      reorderLevel,
      shelfLocation,
      status,
      categories,
      coverImage,
      image,
      galleryImages,
      atcCode,
      initialBatch,
      barcode,
      sku,
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Medicine Name is required' });
    }

    let assignedBarcode = barcode || `6281${Math.floor(10000000 + Math.random() * 90000000)}`;

    const existing = db.medicines.find(
      (m) => m.barcode === assignedBarcode || m.name.toLowerCase() === name.toLowerCase()
    );

    const now = new Date().toISOString();
    let targetMed: any = existing;

    if (!targetMed) {
      const newMed = {
        id: `med-${Date.now()}`,
        barcode: assignedBarcode,
        sku: sku || `MED-${name.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        name,
        genericName: genericName || name,
        brandName: brandName || name,
        categoryId: categoryId || 'cat-1',
        dosageForm: dosageForm || 'Tablet',
        strength: strength || '500mg',
        unit: unit || 'Box',
        manufacturer: manufacturer || 'Standard Pharma',
        description: description || '',
        prescriptionRequired: !!prescriptionRequired,
        reorderLevel: Number(reorderLevel) || 20,
        shelfLocation: shelfLocation || 'Shelf A-01',
        status: status || 'Active',
        categories: categories || ['Medicine'],
        coverImage: coverImage || image || '',
        image: coverImage || image || '',
        galleryImages: galleryImages || [],
        atcCode: atcCode || '',
        isActive: status !== 'Inactive',
        createdAt: now,
        updatedAt: now,
      };
      db.medicines.push(newMed);
      targetMed = newMed;
    } else {
      if (shelfLocation) targetMed.shelfLocation = shelfLocation;
      if (categories && categories.length) targetMed.categories = categories;
      if (coverImage || image) targetMed.coverImage = coverImage || image;
      if (description) targetMed.description = description;
      if (dosageForm) targetMed.dosageForm = dosageForm;
      if (strength) targetMed.strength = strength;
      if (manufacturer) targetMed.manufacturer = manufacturer;
      targetMed.updatedAt = now;
    }

    if (initialBatch && initialBatch.batchNumber && Number(initialBatch.quantity) > 0) {
      const batchObj = {
        id: `bat-${Date.now()}`,
        medicineId: targetMed.id,
        batchNumber: initialBatch.batchNumber,
        manufacturingDate: initialBatch.mfgDate || '2025-01-01',
        expiryDate: initialBatch.expDate || '2028-01-01',
        purchasePrice: Number(initialBatch.purchasePrice) || 10,
        sellingPrice: Number(initialBatch.sellingPrice) || 20,
        initialQuantity: Number(initialBatch.quantity),
        currentQuantity: Number(initialBatch.quantity),
        supplierId: initialBatch.supplierId || 'sup-1',
        createdAt: now,
        updatedAt: now,
      };
      db.medicineBatches.push(batchObj);

      db.inventoryTransactions.unshift({
        id: `tx-${Date.now()}`,
        medicineId: targetMed.id,
        medicineName: targetMed.name,
        batchId: batchObj.id,
        batchNumber: batchObj.batchNumber,
        transactionType: 'INITIAL_STOCK',
        quantity: batchObj.initialQuantity,
        previousQuantity: 0,
        newQuantity: batchObj.initialQuantity,
        performedBy: (req.headers['x-user-id'] as string) || 'u-1',
        notes: 'Medicine stock intake initial batch',
        createdAt: now,
      });
    }

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: (req.headers['x-user-id'] as string) || 'u-1',
      action: existing ? 'MEDICINE_BATCH_ADDED' : 'MEDICINE_CREATED',
      entityType: 'MEDICINE',
      entityId: targetMed.id,
      newData: { name: targetMed.name, barcode: targetMed.barcode },
      createdAt: now,
    });

    res.status(201).json({ success: true, message: 'Medicine registered and stocked successfully', data: targetMed });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

inventoryRouter.put('/medicines/:id', (req, res) => {
  const med = db.medicines.find((m) => m.id === req.params.id);
  if (!med) return res.status(404).json({ success: false, message: 'Medicine not found' });

  Object.assign(med, req.body, { updatedAt: new Date().toISOString() });
  res.json({ success: true, message: 'Medicine updated successfully', data: med });
});

inventoryRouter.delete('/medicines/:id', (req, res) => {
  const medIndex = db.medicines.findIndex((m) => m.id === req.params.id);
  if (medIndex === -1) return res.status(404).json({ success: false, message: 'Medicine not found' });

  const med = db.medicines[medIndex];
  const isPermanent = req.query.permanent === 'true';

  if (isPermanent) {
    db.medicines.splice(medIndex, 1);
    for (let i = db.medicineBatches.length - 1; i >= 0; i--) {
      if (db.medicineBatches[i].medicineId === med.id) {
        db.medicineBatches.splice(i, 1);
      }
    }
  } else {
    med.isActive = false;
    med.updatedAt = new Date().toISOString();
  }

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    userId: (req.headers['x-user-id'] as string) || 'u-1',
    action: isPermanent ? 'MEDICINE_DELETED' : 'MEDICINE_ARCHIVED',
    entityType: 'MEDICINE',
    entityId: med.id,
    oldData: { name: med.name, barcode: med.barcode },
    createdAt: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: isPermanent ? `Medicine '${med.name}' deleted permanently` : `Medicine '${med.name}' archived successfully`,
    data: med,
  });
});

inventoryRouter.post('/medicines/:id/restore', (req, res) => {
  const med = db.medicines.find((m) => m.id === req.params.id);
  if (!med) return res.status(404).json({ success: false, message: 'Medicine not found' });

  med.isActive = true;
  med.updatedAt = new Date().toISOString();

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    userId: (req.headers['x-user-id'] as string) || 'u-1',
    action: 'MEDICINE_RESTORED',
    entityType: 'MEDICINE',
    entityId: med.id,
    newData: { name: med.name, barcode: med.barcode },
    createdAt: new Date().toISOString(),
  });

  res.json({ success: true, message: `Medicine '${med.name}' restored successfully`, data: med });
});

// BULK MEDICINES IMPORT API
inventoryRouter.post('/medicines/bulk-import', (req, res) => {
  try {
    const { medicines: importList, autoCreateCategories = true, updateExistingMedicines = true } = req.body;
    if (!Array.isArray(importList) || importList.length === 0) {
      return res.status(400).json({ success: false, message: 'No medicine records provided for import' });
    }

    let createdCount = 0;
    let updatedCount = 0;
    const now = new Date().toISOString();
    const userId = (req.headers['x-user-id'] as string) || 'u-1';

    for (const item of importList) {
      if (!item.name) continue;

      let category = db.categories.find(
        (c) => c.name.toLowerCase() === (item.categoryName || '').toLowerCase() || c.id === item.categoryId
      );
      if (!category && autoCreateCategories && item.categoryName) {
        category = {
          id: `cat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: item.categoryName,
          description: 'Auto-created from bulk CSV import',
          createdAt: now,
        };
        db.categories.push(category);
      }
      const categoryId = category ? category.id : 'cat-1';

      const existingMed = db.medicines.find(
        (m) =>
          (item.barcode && m.barcode === item.barcode) ||
          m.name.toLowerCase() === item.name.toLowerCase()
      );

      if (existingMed && updateExistingMedicines) {
        if (item.genericName) existingMed.genericName = item.genericName;
        if (item.dosageForm) existingMed.dosageForm = item.dosageForm;
        if (item.strength) existingMed.strength = item.strength;
        if (item.unit) existingMed.unit = item.unit;
        if (item.manufacturer) existingMed.manufacturer = item.manufacturer;
        if (item.reorderLevel) existingMed.reorderLevel = Number(item.reorderLevel);
        existingMed.updatedAt = now;

        if (item.stockQuantity > 0) {
          const newBatch = {
            id: `bat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            medicineId: existingMed.id,
            batchNumber: item.batchNumber || `IMP-BAT-${Math.floor(1000 + Math.random() * 9000)}`,
            manufacturingDate: item.mfgDate || '2025-01-01',
            expiryDate: item.expiryDate || '2028-01-01',
            purchasePrice: Number(item.purchasePrice) || 10,
            sellingPrice: Number(item.sellingPrice) || 20,
            initialQuantity: Number(item.stockQuantity),
            currentQuantity: Number(item.stockQuantity),
            supplierId: 'sup-1',
            createdAt: now,
            updatedAt: now,
          };
          db.medicineBatches.push(newBatch);

          db.inventoryTransactions.unshift({
            id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            medicineId: existingMed.id,
            medicineName: existingMed.name,
            batchId: newBatch.id,
            batchNumber: newBatch.batchNumber,
            transactionType: 'INITIAL_STOCK',
            quantity: newBatch.initialQuantity,
            previousQuantity: 0,
            newQuantity: newBatch.initialQuantity,
            performedBy: userId,
            notes: 'Bulk CSV inventory stock upload',
            createdAt: now,
          });
        }
        updatedCount++;
      } else if (!existingMed) {
        const newMed = {
          id: `med-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          barcode: item.barcode || `KZN-${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`,
          sku: item.sku || `MED-${item.name.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
          name: item.name,
          genericName: item.genericName || item.name,
          brandName: item.brandName || '',
          categoryId,
          dosageForm: item.dosageForm || 'Tablet',
          strength: item.strength || '',
          unit: item.unit || 'Box',
          manufacturer: item.manufacturer || 'Standard Pharma',
          description: item.description || '',
          prescriptionRequired: !!item.prescriptionRequired,
          reorderLevel: Number(item.reorderLevel) || 20,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        };
        db.medicines.push(newMed);

        if (item.stockQuantity > 0) {
          const newBatch = {
            id: `bat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            medicineId: newMed.id,
            batchNumber: item.batchNumber || `IMP-BAT-${Math.floor(1000 + Math.random() * 9000)}`,
            manufacturingDate: item.mfgDate || '2025-01-01',
            expiryDate: item.expiryDate || '2028-01-01',
            purchasePrice: Number(item.purchasePrice) || 10,
            sellingPrice: Number(item.sellingPrice) || 20,
            initialQuantity: Number(item.stockQuantity),
            currentQuantity: Number(item.stockQuantity),
            supplierId: 'sup-1',
            createdAt: now,
            updatedAt: now,
          };
          db.medicineBatches.push(newBatch);

          db.inventoryTransactions.unshift({
            id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            medicineId: newMed.id,
            medicineName: newMed.name,
            batchId: newBatch.id,
            batchNumber: newBatch.batchNumber,
            transactionType: 'INITIAL_STOCK',
            quantity: newBatch.initialQuantity,
            previousQuantity: 0,
            newQuantity: newBatch.initialQuantity,
            performedBy: userId,
            notes: 'Bulk CSV inventory stock registration',
            createdAt: now,
          });
        }
        createdCount++;
      }
    }

    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userId,
      action: 'BULK_MEDICINES_IMPORT',
      entityType: 'INVENTORY',
      entityId: `batch-import-${Date.now()}`,
      newData: { count: importList.length, createdCount, updatedCount },
      createdAt: now,
    });

    res.status(200).json({
      success: true,
      message: `Bulk import completed: ${createdCount} registered, ${updatedCount} updated.`,
      createdCount,
      updatedCount,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// BATCHES & EXPIRY API
inventoryRouter.get('/batches', (req, res) => {
  res.json({ success: true, data: BatchRepository.getBatchesWithStatus() });
});

inventoryRouter.get('/batches/expiring', (req, res) => {
  const batches = BatchRepository.getBatchesWithStatus().filter((b) => b.status === 'EXPIRING_SOON' || b.status === 'EXPIRED');
  res.json({ success: true, data: batches });
});

inventoryRouter.get('/batches/low-stock', (req, res) => {
  const meds = MedicineRepository.list().filter((m) => (m.totalStock || 0) <= m.reorderLevel);
  res.json({ success: true, data: meds });
});

inventoryRouter.post('/batches', (req, res) => {
  try {
    const {
      medicineId,
      batchNumber,
      mfgDate,
      expDate,
      purchasePrice,
      sellingPrice,
      quantity,
      supplierId,
    } = req.body;

    if (!medicineId) return res.status(400).json({ success: false, message: 'Medicine ID is required' });
    if (!batchNumber) return res.status(400).json({ success: false, message: 'Batch number is required' });
    if (!expDate) return res.status(400).json({ success: false, message: 'Expiry date is required' });

    const med = db.medicines.find((m) => m.id === medicineId);
    if (!med) return res.status(404).json({ success: false, message: 'Medicine not found' });

    const existingBatch = db.medicineBatches.find(
      (b) => b.medicineId === medicineId && b.batchNumber.toLowerCase() === batchNumber.trim().toLowerCase()
    );
    if (existingBatch) {
      return res.status(400).json({ success: false, message: `Batch ${batchNumber} already exists for this medicine` });
    }

    const numQty = Number(quantity) || 0;
    const numBuy = Number(purchasePrice) || 0;
    const numSell = Number(sellingPrice) || 0;
    const now = new Date().toISOString();

    const newBatch = {
      id: `bat-${Date.now()}`,
      medicineId,
      batchNumber,
      manufacturingDate: mfgDate || '2025-01-01',
      expiryDate: expDate,
      purchasePrice: numBuy,
      sellingPrice: numSell,
      initialQuantity: numQty,
      currentQuantity: numQty,
      supplierId: supplierId || 'sup-1',
      createdAt: now,
      updatedAt: now,
    };
    db.medicineBatches.push(newBatch);

    if (numQty > 0) {
      db.inventoryTransactions.unshift({
        id: `tx-${Date.now()}`,
        medicineId,
        medicineName: med.name,
        batchId: newBatch.id,
        batchNumber: newBatch.batchNumber,
        transactionType: 'INITIAL_STOCK',
        quantity: numQty,
        previousQuantity: 0,
        newQuantity: numQty,
        referenceId: `BATCH-${newBatch.batchNumber}`,
        referenceType: 'DIRECT_BATCH_INTAKE',
        performedBy: (req.headers['x-user-id'] as string) || 'u-1',
        performedByName: 'Store Pharmacist',
        notes: `Batch ${newBatch.batchNumber} intake (+${numQty} units) recorded`,
        createdAt: now,
      });
    }

    res.status(201).json({ success: true, message: `Batch ${newBatch.batchNumber} registered successfully`, data: newBatch });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// INVENTORY ADJUSTMENT
inventoryRouter.post('/inventory/adjust', (req, res) => {
  try {
    const { medicineId, batchId, transactionType, quantityDelta, notes } = req.body;
    const performedByUserId = (req.headers['x-user-id'] as string) || 'u-1';

    const tx = db.adjustStock({
      medicineId,
      batchId,
      transactionType,
      quantityDelta: Number(quantityDelta),
      notes,
      performedByUserId,
    });

    res.json({ success: true, message: 'Stock adjusted successfully', data: tx });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// INVENTORY TRANSACTIONS
inventoryRouter.get('/inventory/transactions', (req, res) => {
  res.json({ success: true, data: InventoryRepository.getTransactions(200) });
});

// INTER-BRANCH STOCK REQUISITIONS API
const inMemoryStockRequests = [
  {
    id: 'REQ-901',
    requestDate: '2026-08-12',
    fromBranch: 'Bole Sub-Branch',
    toBranch: 'Kaziniya Drug store (Main)',
    itemsRequested: 'Omeprazole 20mg (10 Boxes), Insulin Glargine (5 Vials)',
    urgency: 'HIGH',
    status: 'PENDING_APPROVAL',
    requestedBy: 'Dr. Yonas',
    notes: 'Urgent prescription fulfillment need',
  },
  {
    id: 'REQ-902',
    requestDate: '2026-08-11',
    fromBranch: 'Kazanchis Branch',
    toBranch: 'Kaziniya Drug store (Main)',
    itemsRequested: 'Amoxil 500mg (25 Boxes)',
    urgency: 'NORMAL',
    status: 'TRANSFERRED',
    requestedBy: 'Sara T.',
    notes: 'Weekly routine replenishment',
  },
];

inventoryRouter.get('/inventory/requests', (req, res) => {
  res.json({ success: true, data: inMemoryStockRequests });
});

inventoryRouter.post('/inventory/requests', (req, res) => {
  const { toBranch, itemsRequested, urgency, notes } = req.body;
  if (!itemsRequested) {
    return res.status(400).json({ success: false, message: 'Requested items are required' });
  }

  const newReq = {
    id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
    requestDate: new Date().toISOString().split('T')[0],
    fromBranch: 'Kaziniya Drug store (Current)',
    toBranch: toBranch || 'Central Warehouse',
    itemsRequested,
    urgency: urgency || 'NORMAL',
    status: 'PENDING_APPROVAL',
    requestedBy: (req.headers['x-user-name'] as string) || 'Dispensary Pharmacist',
    notes: notes || '',
  };

  inMemoryStockRequests.unshift(newReq);
  res.status(201).json({ success: true, message: 'Stock transfer request submitted successfully', data: newReq });
});

inventoryRouter.patch('/inventory/requests/:id', (req, res) => {
  const reqItem = inMemoryStockRequests.find((r) => r.id === req.params.id);
  if (!reqItem) return res.status(404).json({ success: false, message: 'Request not found' });

  if (req.body.status) reqItem.status = req.body.status;
  res.json({ success: true, message: `Request updated to ${reqItem.status}`, data: reqItem });
});
