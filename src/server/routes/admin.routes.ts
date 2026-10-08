import { Router } from 'express';
import { db } from '../db.js';
import { requireRole } from '../roleGuard.js';
import { AuditRepository } from '../db/repositories/audit.repository.js';

export const adminRouter = Router();

// PHARMACY FLEET DIRECTORY
adminRouter.get('/fleet/pharmacies', (req, res) => {
  res.json({ success: true, data: db.getRegisteredPharmacies() });
});

adminRouter.post('/fleet/pharmacies', requireRole('SUPER_ADMIN'), (req, res) => {
  try {
    const newNode = db.addRegisteredPharmacy(req.body);
    res.status(201).json({ success: true, message: 'Pharmacy node registered', data: newNode });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

adminRouter.patch('/fleet/pharmacies/:id/status', requireRole('SUPER_ADMIN'), (req, res) => {
  const { status } = req.body;
  const updated = db.updateRegisteredPharmacyStatus(req.params.id, status);
  if (!updated) return res.status(404).json({ success: false, message: 'Pharmacy node not found' });
  res.json({ success: true, message: `Status updated to ${status}`, data: updated });
});

// EFDA COMPLIANCE, RECALLS & SHORTAGES
const inMemoryRecalls: any[] = [
  {
    id: 'RCL-2026-001',
    medicineName: 'Paracetamol 500mg (Contaminated Solvent Alert)',
    batchNumber: 'KZ-PCM-8842',
    manufacturer: 'Cadila Pharmaceuticals',
    recallDate: '2026-08-01',
    severity: 'CLASS_I_CRITICAL',
    status: 'ACTIVE_QUARANTINE',
    reason: 'Trace solvent impurity detected in raw material lot',
    actionRequired: 'Immediately isolate stock in Quarantine Bin and return to distributor',
  },
];

adminRouter.get('/compliance/recalls', (req, res) => {
  res.json({ success: true, data: inMemoryRecalls });
});

adminRouter.post('/compliance/recalls', requireRole('SUPER_ADMIN', 'STORE_OWNER'), (req, res) => {
  const newRecall = {
    id: `RCL-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    ...req.body,
    status: 'ACTIVE_QUARANTINE',
    recallDate: new Date().toISOString().split('T')[0],
  };
  inMemoryRecalls.unshift(newRecall);
  res.status(201).json({ success: true, message: 'Regulatory recall notice posted', data: newRecall });
});

// AUDIT LOGS
adminRouter.get('/audit-logs', (req, res) => {
  res.json({ success: true, data: AuditRepository.list(200) });
});

// DATABASE DDL SCHEMA ENDPOINT
adminRouter.get('/schema', (req, res) => {
  const sqlSchema = `-- KAZINIYA DRUG STORE - ENTERPRISE POSTGRESQL SCHEMA SPECIFICATION
CREATE TABLE pharmacy_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name VARCHAR(255) NOT NULL,
  store_type VARCHAR(100) NOT NULL,
  tin_number VARCHAR(50) UNIQUE NOT NULL,
  efda_license VARCHAR(100) UNIQUE NOT NULL,
  enable_barcode_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode VARCHAR(100) UNIQUE NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255) NOT NULL,
  brand_name VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE medicine_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id UUID REFERENCES medicines(id) ON DELETE CASCADE,
  batch_number VARCHAR(100) NOT NULL,
  manufacturing_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  purchase_price NUMERIC(12,2) NOT NULL,
  selling_price NUMERIC(12,2) NOT NULL,
  current_quantity INT NOT NULL CHECK (current_quantity >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id UUID REFERENCES medicines(id),
  batch_id UUID REFERENCES medicine_batches(id),
  transaction_type VARCHAR(50) NOT NULL,
  quantity INT NOT NULL,
  previous_quantity INT NOT NULL,
  new_quantity INT NOT NULL,
  performed_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  customer_name VARCHAR(255) DEFAULT 'Walk-in Customer',
  total_amount NUMERIC(12,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'CASH',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`;
  res.setHeader('Content-Type', 'text/plain');
  res.send(sqlSchema);
});
