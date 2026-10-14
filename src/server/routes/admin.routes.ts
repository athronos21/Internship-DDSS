import { Router } from 'express';
import { db } from '../db.js';
import { requireRole } from '../roleGuard.js';
import { AuditRepository } from '../db/repositories/audit.repository.js';

export const adminRouter = Router();

// PHARMACY FLEET DIRECTORY
adminRouter.get('/fleet/pharmacies', (req, res) => {
  const fleet = db.getRegisteredPharmacies();
  const cities = Array.from(new Set(fleet.map((p) => p.city)));
  const stats = {
    totalRegistered: fleet.length,
    activeNodes: fleet.filter((p) => p.status === 'ACTIVE' || p.status === 'VERIFIED').length,
    twentyFourHours: fleet.filter((p) => p.is24Hours).length,
    coldChainEquipped: fleet.filter((p) => p.coldChainAvailable).length,
    citiesCovered: cities.length,
    cities,
  };
  res.json({ success: true, data: fleet, stats });
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

// DATABASE DDL SCHEMA SPECIFICATION & ENDPOINTS
const KAZINIYA_POSTGRES_SCHEMA = `-- KAZINIYA DRUG STORE - DOCKER POSTGRESQL 16 ENTERPRISE SCHEMA (docker-compose.yml)
-- Local automated container initialization for kaziniya-postgres (:5432)

CREATE TABLE IF NOT EXISTS pharmacy_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name VARCHAR(255) NOT NULL,
  store_name_amharic VARCHAR(255),
  store_type VARCHAR(100) NOT NULL DEFAULT 'RETAIL_COMMUNITY_PHARMACY',
  tin_number VARCHAR(50) UNIQUE NOT NULL,
  vat_number VARCHAR(50),
  efda_license VARCHAR(100) UNIQUE NOT NULL,
  efda_license_expiry DATE,
  trade_license_number VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(100),
  city VARCHAR(100) DEFAULT 'Addis Ababa',
  subcity VARCHAR(100),
  woreda VARCHAR(50),
  street_address TEXT,
  enable_barcode_system BOOLEAN DEFAULT FALSE,
  is_24_hours BOOLEAN DEFAULT FALSE,
  cold_chain_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medicine_categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode VARCHAR(100) UNIQUE NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255) NOT NULL,
  brand_name VARCHAR(255),
  category_id VARCHAR(50) REFERENCES medicine_categories(id) ON DELETE SET NULL,
  dosage_form VARCHAR(100) NOT NULL,
  strength VARCHAR(100) NOT NULL,
  unit VARCHAR(50) DEFAULT 'Box',
  manufacturer VARCHAR(255),
  description TEXT,
  prescription_required BOOLEAN DEFAULT FALSE,
  reorder_level INT DEFAULT 15,
  shelf_location VARCHAR(100),
  status VARCHAR(50) DEFAULT 'ACTIVE',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medicine_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id UUID REFERENCES medicines(id) ON DELETE CASCADE,
  batch_number VARCHAR(100) NOT NULL,
  manufacturing_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  purchase_price NUMERIC(12,2) NOT NULL,
  selling_price NUMERIC(12,2) NOT NULL,
  initial_quantity INT NOT NULL CHECK (initial_quantity >= 0),
  current_quantity INT NOT NULL CHECK (current_quantity >= 0),
  supplier_name VARCHAR(255),
  quarantine_status VARCHAR(50) DEFAULT 'NORMAL',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  customer_name VARCHAR(255) DEFAULT 'Walk-in Customer',
  customer_phone VARCHAR(50),
  total_amount NUMERIC(12,2) NOT NULL,
  tax_amount NUMERIC(12,2) DEFAULT 0.00,
  payment_method VARCHAR(50) DEFAULT 'CASH',
  cashier_id VARCHAR(100),
  cashier_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'COMPLETED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  medicine_id UUID REFERENCES medicines(id),
  batch_id UUID REFERENCES medicine_batches(id),
  medicine_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL,
  total_price NUMERIC(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id UUID REFERENCES medicines(id),
  batch_id UUID REFERENCES medicine_batches(id),
  transaction_type VARCHAR(50) NOT NULL,
  quantity INT NOT NULL,
  previous_quantity INT NOT NULL,
  new_quantity INT NOT NULL,
  performed_by VARCHAR(100),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  user_name VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100),
  old_data JSONB,
  new_data JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medicines_barcode ON medicines(barcode);
CREATE INDEX IF NOT EXISTS idx_medicines_sku ON medicines(sku);
CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines(name);
CREATE INDEX IF NOT EXISTS idx_batches_expiry ON medicine_batches(expiry_date);
CREATE INDEX IF NOT EXISTS idx_batches_medicine ON medicine_batches(medicine_id);
CREATE INDEX IF NOT EXISTS idx_sales_invoice ON sales(invoice_number);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
`;

adminRouter.get('/database/schema-sql', (req, res) => {
  res.json({
    success: true,
    data: {
      sql: KAZINIYA_POSTGRES_SCHEMA,
    },
  });
});

adminRouter.get('/schema', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(KAZINIYA_POSTGRES_SCHEMA);
});

// PUBLIC CONTACT & PHARMACIST CONSULTATION INQUIRY
adminRouter.post('/contact', (req, res) => {
  try {
    const { name, contact, subject, message } = req.body || {};
    if (!name || typeof name !== 'string' || !contact || typeof contact !== 'string' || !message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Name, contact, and message are required fields.',
      });
    }

    const inquiry = db.addContactInquiry({
      name: name.trim(),
      contact: contact.trim(),
      subject: (subject && typeof subject === 'string') ? subject.trim() : 'General Inquiry',
      message: message.trim(),
    });

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: 'public-guest',
      userName: name.trim(),
      action: 'CUSTOMER_INQUIRY_RECEIVED',
      entityType: 'INQUIRY',
      entityId: inquiry.id,
      newData: {
        name: inquiry.name,
        contact: inquiry.contact,
        subject: inquiry.subject,
        message: inquiry.message,
      },
      ipAddress: req.ip || '127.0.0.1',
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been submitted and registered with our clinical pharmacists.',
      inquiryId: inquiry.id,
      data: inquiry,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
});

// ADMIN CUSTOMER INQUIRIES MANAGEMENT
adminRouter.get('/contact/inquiries', requireRole('STORE_OWNER', 'SUPER_ADMIN'), (req, res) => {
  try {
    const inquiries = db.getContactInquiries();
    res.json({ success: true, data: inquiries });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
});

adminRouter.patch('/contact/inquiries/:id', requireRole('STORE_OWNER', 'SUPER_ADMIN'), (req, res) => {
  try {
    const { id } = req.params;
    const { status, replyNotes } = req.body || {};
    const currentUser = (req as any).user;

    const updated = db.updateContactInquiryStatus(id, {
      status,
      replyNotes,
      repliedBy: currentUser?.name || currentUser?.id || 'Administrator',
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Contact inquiry not found' });
    }

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: currentUser?.id || 'admin',
      userName: currentUser?.name || 'Administrator',
      action: 'CUSTOMER_INQUIRY_UPDATED',
      entityType: 'INQUIRY',
      entityId: id,
      newData: { status: updated.status, replyNotes: updated.replyNotes },
      ipAddress: req.ip || '127.0.0.1',
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, message: 'Inquiry updated successfully', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
});

adminRouter.delete('/contact/inquiries/:id', requireRole('STORE_OWNER', 'SUPER_ADMIN'), (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;
    const deleted = db.deleteContactInquiry(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Contact inquiry not found' });
    }

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: currentUser?.id || 'admin',
      userName: currentUser?.name || 'Administrator',
      action: 'CUSTOMER_INQUIRY_DELETED',
      entityType: 'INQUIRY',
      entityId: id,
      newData: { id },
      ipAddress: req.ip || '127.0.0.1',
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
});

