import { Router } from 'express';
import { db } from '../db.js';
import { SalesRepository } from '../db/repositories/sales.repository.js';
import { MedicineRepository } from '../db/repositories/medicine.repository.js';

export const posRouter = Router();

// SALES & ATOMIC FEFO DISPENSING
posRouter.get('/sales', (req, res) => {
  res.json({ success: true, data: SalesRepository.list(200) });
});

posRouter.get('/sales/barcode/:code', (req, res) => {
  const medicine = MedicineRepository.findByBarcode(req.params.code);
  if (!medicine) {
    return res.status(404).json({ success: false, message: 'No medicine matches this barcode.' });
  }
  res.json({ success: true, data: medicine });
});

posRouter.get('/sales/:id', (req, res) => {
  const sale = SalesRepository.findById(req.params.id);
  if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
  res.json({ success: true, data: sale });
});

posRouter.post('/sales', (req, res) => {
  try {
    const { items, paymentMethod, customerName, discount } = req.body;
    const soldByUserId = (req.headers['x-user-id'] as string) || 'u-1';

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart cannot be empty. Please add items to dispense.' });
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
const inMemoryOrders: any[] = [];

posRouter.get('/orders', (req, res) => {
  res.json({ success: true, data: inMemoryOrders });
});

posRouter.post('/orders', (req, res) => {
  try {
    const { customerName, phone, address, items, totalAmount, paymentMethod } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain items' });
    }

    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `KZ-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: customerName || 'Walk-in Customer',
      phone: phone || '',
      address: address || 'Addis Ababa',
      items,
      totalAmount: Number(totalAmount) || 0,
      paymentMethod: paymentMethod || 'CASH_ON_DELIVERY',
      paymentStatus: 'PENDING',
      orderStatus: 'PENDING_DISPENSATION',
      createdAt: new Date().toISOString(),
    };

    inMemoryOrders.unshift(newOrder);
    res.status(201).json({ success: true, message: 'Prescription order received', data: newOrder });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

posRouter.patch('/orders/:id', (req, res) => {
  const order = inMemoryOrders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  if (req.body.orderStatus) order.orderStatus = req.body.orderStatus;
  if (req.body.paymentStatus) order.paymentStatus = req.body.paymentStatus;
  res.json({ success: true, message: 'Order updated', data: order });
});

// SHIFT HANDOVER
const shiftRecords: any[] = [];

posRouter.get('/shifts', (req, res) => {
  res.json({ success: true, data: shiftRecords });
});

posRouter.post('/shifts/handover', (req, res) => {
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
      outgoingCashierId: outgoingCashierId || 'u-1',
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
