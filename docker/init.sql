-- ========================================================
-- KAZINIYA DRUG STORE - POSTGRESQL MASTER SCHEMA & SEED
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom Enum Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'STORE_OWNER', 'PHARMACIST', 'CUSTOMER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('INITIAL_STOCK', 'PURCHASE', 'SALE', 'SALE_RETURN', 'PURCHASE_RETURN', 'ADJUSTMENT', 'DAMAGED', 'EXPIRED', 'TRANSFER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('CASH', 'CARD', 'MOBILE_MONEY', 'BANK_TRANSFER', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'PHARMACIST',
  phone VARCHAR(50),
  employee_id VARCHAR(50),
  department VARCHAR(100),
  pharmacist_license VARCHAR(100),
  password_hash VARCHAR(255),
  pin_code VARCHAR(10),
  must_change_password BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SUPPLIERS TABLE
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  license_number VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MEDICINES TABLE
CREATE TABLE IF NOT EXISTS medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode VARCHAR(100) UNIQUE NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255) NOT NULL,
  brand_name VARCHAR(255),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  dosage_form VARCHAR(100) NOT NULL,
  strength VARCHAR(100) NOT NULL,
  unit VARCHAR(100) NOT NULL,
  manufacturer VARCHAR(255),
  description TEXT,
  prescription_required BOOLEAN DEFAULT FALSE,
  reorder_level INT DEFAULT 20,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MEDICINE BATCHES TABLE (FEFO Enforcement)
CREATE TABLE IF NOT EXISTS medicine_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  batch_number VARCHAR(100) NOT NULL,
  manufacturing_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  purchase_price NUMERIC(12,2) NOT NULL,
  selling_price NUMERIC(12,2) NOT NULL,
  initial_quantity INT NOT NULL,
  current_quantity INT NOT NULL CHECK (current_quantity >= 0),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(medicine_id, batch_number)
);

-- 6. INVENTORY TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id UUID NOT NULL REFERENCES medicines(id),
  batch_id UUID REFERENCES medicine_batches(id),
  transaction_type transaction_type NOT NULL,
  quantity INT NOT NULL,
  previous_quantity INT NOT NULL,
  new_quantity INT NOT NULL,
  reference_id VARCHAR(100),
  reference_type VARCHAR(50),
  performed_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PURCHASES TABLE
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id),
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  purchase_date DATE NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'COMPLETED',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SALES TABLE
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  customer_name VARCHAR(255) DEFAULT 'Walk-in Customer',
  customer_phone VARCHAR(50),
  subtotal NUMERIC(12,2) NOT NULL,
  discount NUMERIC(12,2) DEFAULT 0,
  tax NUMERIC(12,2) DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL,
  payment_method payment_method DEFAULT 'CASH',
  payment_status VARCHAR(50) DEFAULT 'PAID',
  sold_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SALE ITEMS TABLE
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES medicines(id),
  batch_id UUID REFERENCES medicine_batches(id),
  batch_number VARCHAR(100) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  old_data JSONB,
  new_data JSONB,
  details TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. REGISTERED PHARMACY NODES TABLE
CREATE TABLE IF NOT EXISTS registered_pharmacy_nodes (
  id VARCHAR(50) PRIMARY KEY,
  store_name VARCHAR(255) NOT NULL,
  store_name_amharic VARCHAR(255),
  store_type VARCHAR(100) NOT NULL,
  tin_number VARCHAR(50) NOT NULL,
  efda_license VARCHAR(100) NOT NULL,
  efda_license_expiry DATE,
  owner_name VARCHAR(255) NOT NULL,
  owner_title VARCHAR(100),
  owner_phone VARCHAR(50),
  owner_email VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  subcity VARCHAR(100),
  woreda VARCHAR(50),
  street_address TEXT,
  landmark VARCHAR(255),
  latitude NUMERIC(10,6),
  longitude NUMERIC(10,6),
  phone VARCHAR(100),
  email VARCHAR(255),
  operating_hours VARCHAR(100),
  is_24_hours BOOLEAN DEFAULT FALSE,
  cold_chain_available BOOLEAN DEFAULT TRUE,
  delivery_available BOOLEAN DEFAULT TRUE,
  active_staff_count INT DEFAULT 1,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  sku_count INT DEFAULT 0,
  monthly_gmv NUMERIC(14,2) DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 5.0,
  logo_url TEXT,
  registered_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_medicines_barcode ON medicines(barcode);
CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines(name);
CREATE INDEX IF NOT EXISTS idx_medicines_category ON medicines(category_id);
CREATE INDEX IF NOT EXISTS idx_batches_expiry ON medicine_batches(expiry_date);
CREATE INDEX IF NOT EXISTS idx_batches_medicine ON medicine_batches(medicine_id);
CREATE INDEX IF NOT EXISTS idx_sales_created ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_inv_tx_created ON inventory_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- ========================================================
-- SEED INITIAL DATA
-- ========================================================

-- Seed Default Admin & Pharmacist Users
INSERT INTO users (id, name, email, role, phone, employee_id, department, pharmacist_license, is_active)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'Dr. Alemu Tadesse', 'admin@kaziniya.com', 'STORE_OWNER', '+251 911 234 567', 'KZN-ADMIN-001', 'Executive Management & Clinical Pharmacy', 'EFDA-LIC-04812', true),
  ('a0000000-0000-0000-0000-000000000002', 'Pharm. Solomon Bekele', 'pharmacist@kaziniya.com', 'PHARMACIST', '+251 933 456 789', 'KZN-PH-002', 'Clinical Dispensing & POS Counter', 'EFDA-DISP-0982', true),
  ('a0000000-0000-0000-0000-000000000003', 'Pharm. Bethlehem Worku', 'bethlehem@kaziniya.com', 'PHARMACIST', '+251 922 345 678', 'KZN-PH-003', 'Prescription Verification & Dispensing', 'EFDA-DISP-1140', true)
ON CONFLICT (email) DO NOTHING;

-- Seed Categories
INSERT INTO categories (id, name, description)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Pain Relief & Analgesics', 'Pain killers, anti-inflammatory drugs'),
  ('c0000000-0000-0000-0000-000000000002', 'Antibiotics & Anti-Infectives', 'Antibacterial, antifungal, antiviral medications'),
  ('c0000000-0000-0000-0000-000000000003', 'Antimalarial', 'Malaria prevention and treatment'),
  ('c0000000-0000-0000-0000-000000000004', 'Vitamins & Minerals', 'Supplements, immune boosters, multivitamin blends'),
  ('c0000000-0000-0000-0000-000000000005', 'Gastrointestinal', 'Antacids, PPIs, anti-diarrheal remedies'),
  ('c0000000-0000-0000-0000-000000000006', 'Respiratory & Cold', 'Cough syrups, bronchodilators, antihistamines'),
  ('c0000000-0000-0000-0000-000000000007', 'Cardiovascular & Diabetes', 'Hypertension, blood sugar management')
ON CONFLICT (name) DO NOTHING;

-- Seed Suppliers
INSERT INTO suppliers (id, name, contact_person, phone, email, address, license_number, is_active)
VALUES
  ('s0000000-0000-0000-0000-000000000001', 'MedPharm Wholesale Ltd', 'Abebe Molla', '+251 115 512 345', 'orders@medpharm.com.et', 'Bole Subcity, Woreda 03, Addis Ababa', 'EFDA/LIC/2024/0912', true),
  ('s0000000-0000-0000-0000-000000000002', 'Global Health Supplies PLC', 'Tigist Hailu', '+251 116 634 890', 'sales@globalhealth.et', 'Merkato Pharma Complex, Addis Ababa', 'EFDA/LIC/2023/1844', true),
  ('s0000000-0000-0000-0000-000000000003', 'East Africa Pharma Distributors', 'Dawit Cherenet', '+251 114 420 111', 'info@eapharm.com', 'Gotera Industrial Zone, Addis Ababa', 'EFDA/LIC/2025/0022', true)
ON CONFLICT DO NOTHING;

-- Seed Medicines
INSERT INTO medicines (id, barcode, sku, name, generic_name, brand_name, category_id, dosage_form, strength, unit, manufacturer, prescription_required, reorder_level)
VALUES
  ('m0000000-0000-0000-0000-000000000001', '890103000001', 'MED-PAR-500', 'Paracetamol 500mg Tablets', 'Paracetamol', 'Panadol', 'c0000000-0000-0000-0000-000000000001', 'Tablet', '500mg', 'Strip (10 tabs)', 'GlaxoSmithKline / Cadila', false, 50),
  ('m0000000-0000-0000-0000-000000000002', '890103000002', 'MED-AMX-500', 'Amoxicillin 500mg Capsules', 'Amoxicillin', 'Amoxil', 'c0000000-0000-0000-0000-000000000002', 'Capsule', '500mg', 'Box (100 caps)', 'EPHARM Ethiopia', true, 30),
  ('m0000000-0000-0000-0000-000000000003', '890103000003', 'MED-COA-020', 'Coartem 20/120mg Tablets', 'Artemether + Lumefantrine', 'Coartem', 'c0000000-0000-0000-0000-000000000003', 'Tablet', '20mg/120mg', 'Box (24 tabs)', 'Novartis Pharma AG', true, 25),
  ('m0000000-0000-0000-0000-000000000004', '890103000004', 'MED-OMP-020', 'Omeprazole 20mg Capsules', 'Omeprazole', 'Prilosec / Losec', 'c0000000-0000-0000-0000-000000000005', 'Capsule', '20mg', 'Strip (14 caps)', 'AstraZeneca / Dawa Ltd', false, 40),
  ('m0000000-0000-0000-0000-000000000005', '890103000005', 'MED-CIP-500', 'Ciprofloxacin 500mg Tablets', 'Ciprofloxacin', 'Ciprobay', 'c0000000-0000-0000-0000-000000000002', 'Tablet', '500mg', 'Box (10 tabs)', 'Bayer AG', true, 20),
  ('m0000000-0000-0000-0000-000000000006', '890103000006', 'MED-MET-500', 'Metformin 500mg Tablets', 'Metformin HCl', 'Glucophage', 'c0000000-0000-0000-0000-000000000007', 'Tablet', '500mg', 'Box (100 tabs)', 'Merck Serono', true, 35)
ON CONFLICT (barcode) DO NOTHING;

-- Seed Medicine Batches (with FEFO expiry dates)
INSERT INTO medicine_batches (id, medicine_id, batch_number, manufacturing_date, expiry_date, purchase_price, selling_price, initial_quantity, current_quantity, supplier_id)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'm0000000-0000-0000-0000-000000000001', 'BT-PAR-2401', '2024-01-10', '2026-12-31', 25.00, 45.00, 500, 320, 's0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000002', 'm0000000-0000-0000-0000-000000000001', 'BT-PAR-2402', '2024-06-15', '2027-06-30', 27.50, 45.00, 400, 400, 's0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000003', 'm0000000-0000-0000-0000-000000000002', 'BT-AMX-2309', '2023-09-01', '2026-08-31', 120.00, 185.00, 150, 85, 's0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000004', 'm0000000-0000-0000-0000-000000000003', 'BT-COA-2403', '2024-03-20', '2027-03-19', 210.00, 310.00, 200, 145, 's0000000-0000-0000-0000-000000000003'),
  ('b0000000-0000-0000-0000-000000000005', 'm0000000-0000-0000-0000-000000000004', 'BT-OMP-2404', '2024-04-12', '2027-04-10', 65.00, 110.00, 300, 210, 's0000000-0000-0000-0000-000000000001')
ON CONFLICT (medicine_id, batch_number) DO NOTHING;

-- Seed Pharmacy Node (Flagship)
INSERT INTO registered_pharmacy_nodes (
  id, store_name, store_name_amharic, store_type, tin_number, efda_license, efda_license_expiry,
  owner_name, owner_title, owner_phone, owner_email, city, subcity, woreda, street_address,
  landmark, latitude, longitude, phone, email, operating_hours, is_24_hours, cold_chain_available,
  delivery_available, active_staff_count, status, sku_count, monthly_gmv, rating, registered_at
)
VALUES (
  'node-01', 'Kaziniya Flagship Pharmacy & Health Center', 'ካዚኒያ ዋና ፋርማሲና የጤና ማዕከል',
  'COMMUNITY_DRUG_STORE', '0098234123', 'EFDA/DISP/AA/2024/8492', '2027-12-31',
  'Dr. Alemu Tadesse', 'Chief Pharmacist & Medical Director', '+251 911 234 567', 'admin@kaziniya.com',
  'Addis Ababa', 'Bole Subcity', 'Woreda 03', 'Bole Medhanealem Road, Swaziland St, Next to Edna Mall',
  'Opposite Central Healthcare Plaza', 9.0018, 38.7845, '+251 11 661 2345 / +251 911 234 567',
  'contact@kaziniyapharmacy.et', 'Open 24/7 (365 Days Emergency Service)', true, true, true, 8,
  'ACTIVE', 420, 1845000, 4.9, '2026-01-01T08:00:00Z'
)
ON CONFLICT (id) DO NOTHING;
