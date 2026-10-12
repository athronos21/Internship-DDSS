import { Router } from 'express';
import { db } from '../db.js';
import { SalesRepository } from '../db/repositories/sales.repository.js';
import { MedicineRepository } from '../db/repositories/medicine.repository.js';
import { OrderRepository } from '../db/repositories/order.repository.js';
import { requireRole, AuthenticatedRequest } from '../roleGuard.js';

export const posRouter = Router();

// SALES & ATOMIC FEFO DISPENSING
posRouter.get('/sales', requireRole(['PHARMACIST', 'STORE_OWNER', 'SUPER_ADMIN']), (req: AuthenticatedRequest, res) => {
  res.json({ success: true, data: SalesRepository.list(200) });
});

posRouter.get('/sales/barcode/:code', (req, res) => {
  const medicine = MedicineRepository.findByBarcode(req.params.code);
  if (!medicine) {
    return res.status(404).json({ success: false, message: 'No medicine matches this barcode.' });
  }
  res.json({ success: true, data: medicine });
});

posRouter.get('/sales/:id', requireRole(['PHARMACIST', 'STORE_OWNER', 'SUPER_ADMIN']), (req: AuthenticatedRequest, res) => {
  const sale = SalesRepository.findById(req.params.id);
  if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
  res.json({ success: true, data: sale });
});

posRouter.post('/sales', requireRole(['PHARMACIST', 'STORE_OWNER', 'SUPER_ADMIN']), (req: AuthenticatedRequest, res) => {
  try {
    const { items, paymentMethod, customerName, discount } = req.body;
    const soldByUserId = req.user?.id || 'u-1';

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart cannot be empty. Please add items to dispense.' });
    }

    if (items.length > 100) {
      return res.status(400).json({ success: false, message: 'Cart exceeds maximum allowed items (100).' });
    }

    for (const item of items) {
      if (!item || !item.medicineId || typeof item.medicineId !== 'string') {
        return res.status(400).json({ success: false, message: 'Each item must have a valid medicineId.' });
      }
      if (
        typeof item.quantity !== 'number' ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0 ||
        item.quantity > 10000
      ) {
        return res.status(400).json({
          success: false,
          message: 'Item quantity must be a positive integer between 1 and 10,000.',
        });
      }
      if (item.discount !== undefined && (typeof item.discount !== 'number' || item.discount < 0)) {
        return res.status(400).json({ success: false, message: 'Item discount must be a non-negative number.' });
      }
    }

    if (discount !== undefined && (typeof discount !== 'number' || discount < 0)) {
      return res.status(400).json({ success: false, message: 'Overall discount must be a non-negative number.' });
    }

    const processedSale = SalesRepository.processSale({
      items,
      paymentMethod,
      customerName,
      discount,
      soldByUserId,
    });

    res.status(201).json({
      success: true,
      message: 'Dispensation transaction processed successfully via FEFO.',
      data: processedSale,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ORDERS MANAGEMENT (Online Customer Storefront Orders)
posRouter.get('/orders', requireRole(['PHARMACIST', 'STORE_OWNER', 'SUPER_ADMIN']), (req: AuthenticatedRequest, res) => {
  res.json({ success: true, data: OrderRepository.list(200) });
});

posRouter.post('/orders', (req, res) => {
  try {
    const { customerName, phone, address, items, paymentMethod } = req.body;
    const newOrder = OrderRepository.createOrder({
      customerName,
      phone,
      address,
      items,
      paymentMethod,
    });
    res.status(201).json({ success: true, message: 'Prescription order received', data: newOrder });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

posRouter.patch('/orders/:id', requireRole(['PHARMACIST', 'STORE_OWNER', 'SUPER_ADMIN']), (req: AuthenticatedRequest, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = OrderRepository.updateStatus(req.params.id, {
      orderStatus,
      paymentStatus,
    });
    res.json({ success: true, message: 'Order updated', data: order });
  } catch (err: any) {
    if (err.message === 'Order not found.') {
      return res.status(404).json({ success: false, message: err.message });
    }
    res.status(400).json({ success: false, message: err.message });
  }
});

// SHIFT HANDOVER
const shiftRecords: any[] = [];

posRouter.get('/shifts', requireRole(['PHARMACIST', 'STORE_OWNER', 'SUPER_ADMIN']), (req: AuthenticatedRequest, res) => {
  res.json({ success: true, data: shiftRecords });
});

posRouter.post('/shifts/handover', requireRole(['PHARMACIST', 'STORE_OWNER', 'SUPER_ADMIN']), (req: AuthenticatedRequest, res) => {
  try {
    const {
      outgoingCashierId,
      incomingCashierId,
      cashOnHand,
      telebirrRecorded,
      cbeRecorded,
      notes,
    } = req.body;

    const record = {
      id: `shift-${Date.now()}`,
      outgoingCashierId: req.user?.id || outgoingCashierId || 'u-1',
      incomingCashierId: incomingCashierId || 'u-2',
      cashOnHand: Number(cashOnHand) || 0,
      telebirrRecorded: Number(telebirrRecorded) || 0,
      cbeRecorded: Number(cbeRecorded) || 0,
      notes: notes || '',
      timestamp: new Date().toISOString(),
    };

    shiftRecords.unshift(record);

    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userId: record.outgoingCashierId,
      action: 'SHIFT_HANDOVER_EXECUTED',
      entityType: 'SHIFT',
      entityId: record.id,
      newData: record,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ success: true, message: 'Shift handover logged successfully', data: record });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
