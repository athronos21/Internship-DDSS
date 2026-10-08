import { Router } from 'express';
import { db } from '../db.js';
import { PurchaseRepository } from '../db/repositories/purchase.repository.js';

export const purchasingRouter = Router();

// SUPPLIERS API
purchasingRouter.get('/suppliers', (req, res) => {
  res.json({ success: true, data: PurchaseRepository.listSuppliers() });
});

purchasingRouter.post('/suppliers', (req, res) => {
  try {
    const { name, contactPerson, phone, email, tinNumber, address, creditLimit, paymentTerms } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Supplier name is required' });

    const newSup = PurchaseRepository.createSupplier({
      name,
      contactPerson,
      phone,
      email,
      tinNumber,
      address,
      creditLimit,
      paymentTerms,
    });

    res.status(201).json({ success: true, message: 'Supplier registered successfully', data: newSup });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PURCHASES API
purchasingRouter.get('/purchases', (req, res) => {
  res.json({ success: true, data: PurchaseRepository.listPurchases() });
});

purchasingRouter.post('/purchases', (req, res) => {
  try {
    const { supplierId, invoiceNumber, purchaseDate, items } = req.body;
    const createdByUserId = (req.headers['x-user-id'] as string) || 'u-1';

    if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Supplier and purchase items are required' });
    }

    const purchase = PurchaseRepository.createPurchaseOrder({
      supplierId,
      invoiceNumber: invoiceNumber || `INV-SUP-${Date.now().toString().slice(-4)}`,
      purchaseDate: purchaseDate || new Date().toISOString().split('T')[0],
      createdByUserId,
      items,
    });

    res.status(201).json({ success: true, message: 'Purchase order & stock intake processed', data: purchase });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PURCHASE ORDERS & GOODS RECEIPT IN-MEMORY STORE
const inMemoryPurchaseOrders: any[] = [];
const inMemoryGoodsReceipts: any[] = [];

purchasingRouter.get('/purchase-orders', (req, res) => {
  res.json({ success: true, data: inMemoryPurchaseOrders });
});

purchasingRouter.post('/purchase-orders', (req, res) => {
  try {
    const { supplierId, supplierName, expectedDeliveryDate, items, totalAmount, notes } = req.body;
    if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Supplier and line items are required' });
    }

    const newPO = {
      id: `po-${Date.now()}`,
      poNumber: `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierId,
      supplierName: supplierName || 'Supplier',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: expectedDeliveryDate || '',
      status: 'ISSUED',
      totalAmount: Number(totalAmount) || 0,
      items,
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };

    inMemoryPurchaseOrders.unshift(newPO);
    res.status(201).json({ success: true, message: 'Purchase order created successfully', data: newPO });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

purchasingRouter.get('/goods-receipts', (req, res) => {
  res.json({ success: true, data: inMemoryGoodsReceipts });
});

purchasingRouter.post('/goods-receipts', (req, res) => {
  try {
    const { poId, poNumber, supplierName, itemsReceived, receivedBy, notes } = req.body;
    const newGrn = {
      id: `grn-${Date.now()}`,
      grnNumber: `GRN-${Math.floor(10000 + Math.random() * 90000)}`,
      poId: poId || '',
      poNumber: poNumber || '',
      supplierName: supplierName || '',
      receiptDate: new Date().toISOString().split('T')[0],
      receivedBy: receivedBy || 'Inventory Officer',
      itemsReceived: itemsReceived || [],
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };

    inMemoryGoodsReceipts.unshift(newGrn);
    res.status(201).json({ success: true, message: 'Goods receipt note recorded', data: newGrn });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
