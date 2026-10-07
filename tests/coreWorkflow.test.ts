import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import { Server } from 'http';
import { startServer } from '../server';
import { db } from '../src/server/db';
import { PaymentMethod } from '../src/types';

describe('Core Pharmacy Platform Workflows', () => {
  let serverInstance: Server;
  const TEST_PORT = 5388;
  const baseUrl = `http://localhost:${TEST_PORT}`;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const result = await startServer(TEST_PORT);
    serverInstance = result.server;
  });

  afterAll((done) => {
    if (serverInstance) {
      serverInstance.close(() => done());
    } else {
      done();
    }
  });

  // =========================================================================
  // WORKFLOW 1: REGISTER NEW DRUG STORE
  // =========================================================================
  describe('1. Register New Drug Store', () => {
    const timestamp = Date.now();
    const storeEmail = `director.${timestamp}@addisdrugstore.et`;
    const tin = `00${Math.floor(10000000 + Math.random() * 90000000)}`;

    const storePayload = {
      ownerTitle: 'Dr.',
      ownerName: `Dr. Tewodros Kassahun ${timestamp}`,
      ownerEmail: storeEmail,
      ownerPhone: '+251 911 234 567',
      password: 'StrongPassword#2026',
      pin: '3344',
      storeName: `Addis Abay Community Drug Store ${timestamp}`,
      storeNameAmharic: 'አዲስ አባይ የመድኃኒት መደብር',
      storeType: 'COMMUNITY_DRUG_STORE' as const,
      tinNumber: tin,
      efdaLicense: `EFDA-RET-2026-${timestamp.toString().slice(-4)}`,
      efdaLicenseExpiry: '2028-12-31',
      city: 'Addis Ababa',
      subcity: 'Bole Subcity',
      woreda: 'Woreda 03',
      streetAddress: 'Cameroon Street, Opposite Edna Mall',
      landmark: 'Bole Medhanealem Area',
      operatingHours: 'Open 24/7 (365 Days Emergency Service)',
      is24Hours: true,
      coldChainAvailable: true,
      deliveryAvailable: true,
      telebirrMerchantId: 'TB-MERCH-88990',
      cbeAccountNumber: '100029384756',
      openingCashFloat: 5000,
    };

    it('Rejects drug store registration when required fields are missing (HTTP 400)', async () => {
      const res = await fetch(`${baseUrl}/api/auth/register-owner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerName: 'Incomplete Registration' }),
      });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.message).toBeDefined();
    });

    it('Successfully registers a new Drug Store node and creates Store Owner account (HTTP 201)', async () => {
      const res = await fetch(`${baseUrl}/api/auth/register-owner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storePayload),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.user).toBeDefined();
      expect(data.data.user.email).toBe(storeEmail);
      expect(data.data.user.role).toBe('STORE_OWNER');
      expect(data.data.pharmacy.storeName).toBe(storePayload.storeName);
      expect(data.data.pharmacy.tinNumber).toBe(tin);
    });

    it('Verifies the newly registered drug store appears in nationwide fleet directory', async () => {
      const res = await fetch(`${baseUrl}/api/fleet/pharmacies`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);

      const registeredNode = data.data.find((node: any) => node.tinNumber === tin);
      expect(registeredNode).toBeDefined();
      expect(registeredNode.storeName).toBe(storePayload.storeName);
      expect(registeredNode.city).toBe('Addis Ababa');
    });

    it('Verifies the newly registered Store Owner can authenticate immediately', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: storeEmail,
          password: 'StrongPassword#2026',
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.role).toBe('STORE_OWNER');
      expect(data.data.isOwner).toBe(true);
    });
  });

  // =========================================================================
  // WORKFLOW 2: SIGNUP ALL ROLES
  // =========================================================================
  describe('2. Signup All Institutional Roles', () => {
    const timestamp = Date.now();
    const rolesToTest = [
      {
        role: 'SUPER_ADMIN',
        name: `National Auditor ${timestamp}`,
        email: `auditor.${timestamp}@moh.gov.et`,
        department: 'Whole System Administration & Governance',
        password: 'AdminSuper#2026',
      },
      {
        role: 'STORE_OWNER',
        name: `Branch Director ${timestamp}`,
        email: `owner.${timestamp}@kaziniya.com`,
        department: 'Drug Store Ownership & Executive Management',
        password: 'OwnerPass#2026',
      },
      {
        role: 'PHARMACIST',
        name: `Pharm. Selamawit Desta ${timestamp}`,
        email: `selam.${timestamp}@kaziniya.com`,
        department: 'Prescription Dispensary & Counter POS',
        password: 'PharmaPass#2026',
      },
    ];

    for (const roleDef of rolesToTest) {
      it(`Creates and signs up account for role: ${roleDef.role} (HTTP 201)`, async () => {
        const createRes = await fetch(`${baseUrl}/api/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': 'u-1', // Super Admin or Owner creates staff
          },
          body: JSON.stringify({
            name: roleDef.name,
            email: roleDef.email,
            role: roleDef.role,
            department: roleDef.department,
            temporaryPassword: roleDef.password,
            mustChangePassword: false,
          }),
        });

        expect(createRes.status).toBe(201);
        const createData = await createRes.json();
        expect(createData.success).toBe(true);
        expect(createData.data.role).toBe(roleDef.role);
        expect(createData.data.email).toBe(roleDef.email);

        // Verify successful login for the newly signed-up role
        const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: roleDef.email,
            password: roleDef.password,
          }),
        });

        expect(loginRes.status).toBe(200);
        const loginData = await loginRes.json();
        expect(loginData.success).toBe(true);
        expect(loginData.data.role).toBe(roleDef.role);
      });
    }

    it('Verifies RBAC access matrix and permission boundaries across created roles', async () => {
      const res = await fetch(`${baseUrl}/api/auth/role-matrix`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.roles.SUPER_ADMIN.permissions).toContain('VIEW_GLOBAL_AUDIT_LOGS');
      expect(data.roles.STORE_OWNER.permissions).toContain('MANAGE_INVENTORY');
      expect(data.roles.PHARMACIST.permissions).toContain('USE_POS_CHECKOUT');
      expect(data.roles.PHARMACIST.permissions).not.toContain('VIEW_GLOBAL_AUDIT_LOGS');
    });
  });

  // =========================================================================
  // WORKFLOW 3: ADD MEDICINE TO THE INVENTORY
  // =========================================================================
  describe('3. Add Medicine to the Inventory', () => {
    let createdMedicineId = '';
    const testBarcode = `6281${Date.now().toString().slice(-8)}`;
    const testBatchNumber = `ETH-BATCH-${Date.now().toString().slice(-5)}`;

    it('Rejects medicine registration when required metadata is missing (HTTP 400)', async () => {
      const res = await fetch(`${baseUrl}/api/medicines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'u-1',
        },
        body: JSON.stringify({
          genericName: 'Ciprofloxacin',
          strength: '500mg',
        }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.message).toContain('Medicine Name is required');
    });

    it('Successfully adds a new medicine with full EFDA metadata and initial stock batch (HTTP 201)', async () => {
      const payload = {
        name: 'Ciprofloxacin Hydrochloride 500mg',
        brandName: 'Cipro-Denk 500',
        genericName: 'Ciprofloxacin Hydrochloride',
        strength: '500mg',
        dosageForm: 'Film-Coated Tablet',
        unit: 'Box of 10 Tablets',
        unitOfMeasure: 'Tablet',
        manufacturer: 'Denk Pharma GmbH (Germany)',
        barcode: testBarcode,
        sku: `MED-CIPRO-${Date.now().toString().slice(-4)}`,
        categoryId: 'cat-2', // Antibiotics
        shelfLocation: 'Section B, Shelf 4',
        prescriptionRequired: true,
        reorderLevel: 25,
        initialBatch: {
          batchNumber: testBatchNumber,
          mfgDate: '2025-06-01',
          expDate: '2027-06-30',
          quantity: 100,
          purchasePrice: 180.0,
          sellingPrice: 240.0,
        },
      };

      const res = await fetch(`${baseUrl}/api/medicines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'u-1',
        },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBeDefined();
      expect(data.data.name).toBe(payload.name);
      expect(data.data.barcode).toBe(testBarcode);

      createdMedicineId = data.data.id;
    });

    it('Verifies the newly added medicine appears in /api/medicines with computed stock', async () => {
      const res = await fetch(`${baseUrl}/api/medicines`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      const found = data.data.find((m: any) => m.id === createdMedicineId);
      expect(found).toBeDefined();
      expect(found.totalStock).toBe(100);
      expect(found.sellingPrice).toBe(240.0);
      expect(found.barcode).toBe(testBarcode);
    });

    it('Verifies the batch is registered under /api/batches with active status', async () => {
      const res = await fetch(`${baseUrl}/api/batches`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      const batch = data.data.find((b: any) => b.batchNumber === testBatchNumber);
      expect(batch).toBeDefined();
      expect(batch.currentQuantity).toBe(100);
      expect(batch.expiryDate).toBe('2027-06-30');
      expect(batch.status).toBe('ACTIVE');
    });
  });

  // =========================================================================
  // WORKFLOW 4: MANAGE MEDICINES THAT ARE ADDED TO INVENTORY
  // =========================================================================
  describe('4. Manage Medicines in Inventory', () => {
    let targetMedicine: any;
    let initialBatch: any;

    beforeAll(async () => {
      const res = await fetch(`${baseUrl}/api/medicines`);
      const data = await res.json();
      targetMedicine = data.data[0];

      const batchRes = await fetch(`${baseUrl}/api/batches`);
      const batchData = await batchRes.json();
      initialBatch = batchData.data.find((b: any) => b.medicineId === targetMedicine.id);
    });

    it('Queries medicine by barcode for high-speed POS barcode scanner', async () => {
      const res = await fetch(`${baseUrl}/api/medicines/barcode/${encodeURIComponent(targetMedicine.barcode)}`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.medicine.id).toBe(targetMedicine.id);
      expect(data.data.medicine.barcode).toBe(targetMedicine.barcode);
    });

    it('Updates medicine clinical & pricing metadata via PUT /api/medicines/:id', async () => {
      const updatePayload = {
        reorderLevel: 45,
        shelfLocation: 'Updated Shelf Zone A-01',
        description: 'Updated clinical indication notes for patient counseling.',
        sellingPrice: 320.0,
      };

      const res = await fetch(`${baseUrl}/api/medicines/${targetMedicine.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'u-1',
        },
        body: JSON.stringify(updatePayload),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.reorderLevel).toBe(45);
      expect(data.data.shelfLocation).toBe('Updated Shelf Zone A-01');
    });

    it('Adds a secondary batch with an earlier expiration date and enforces FEFO queue ordering', async () => {
      const earlierBatchNumber = `FEFO-EARLY-${Date.now().toString().slice(-4)}`;
      const newBatchPayload = {
        medicineId: targetMedicine.id,
        batchNumber: earlierBatchNumber,
        mfgDate: '2024-01-01',
        expDate: '2026-11-30', // Earlier expiry!
        quantity: 50,
        purchasePrice: 150.0,
        sellingPrice: 300.0,
      };

      const res = await fetch(`${baseUrl}/api/batches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'u-1',
        },
        body: JSON.stringify(newBatchPayload),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.batchNumber).toBe(earlierBatchNumber);
      expect(data.data.currentQuantity).toBe(50);

      // Verify total stock increased
      const medRes = await fetch(`${baseUrl}/api/medicines/${targetMedicine.id}`);
      const medData = await medRes.json();
      expect(medData.success).toBe(true);
      expect(medData.data.medicine.totalStock).toBeGreaterThanOrEqual(50);
      expect(medData.data.medicine.earliestExpiry).toBe('2026-11-30');
    });

    it('Performs physical stock inventory count adjustment (+10 units) via POST /api/inventory/adjust', async () => {
      const batchesRes = await fetch(`${baseUrl}/api/batches`);
      const batchesData = await batchesRes.json();
      const batchToAdjust = batchesData.data.find((b: any) => b.medicineId === targetMedicine.id);
      expect(batchToAdjust).toBeDefined();

      const prevQty = batchToAdjust.currentQuantity;
      const adjustRes = await fetch(`${baseUrl}/api/inventory/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'u-1',
        },
        body: JSON.stringify({
          medicineId: targetMedicine.id,
          batchId: batchToAdjust.id,
          quantityDelta: 10,
          transactionType: 'PHYSICAL_COUNT',
          notes: 'Quarterly shelf stock physical audit verification',
        }),
      });

      expect(adjustRes.status).toBe(200);
      const adjustData = await adjustRes.json();
      expect(adjustData.success).toBe(true);
      expect(adjustData.data.newQuantity).toBe(prevQty + 10);
    });

    it('Executes POS dispensing sale and atomically reduces batch stock according to FEFO queue', async () => {
      const medRes = await fetch(`${baseUrl}/api/medicines/${targetMedicine.id}`);
      const medData = await medRes.json();
      const initialTotalStock = medData.data.medicine.totalStock;
      expect(initialTotalStock).toBeGreaterThan(0);

      const saleRes = await fetch(`${baseUrl}/api/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'u-munaa', // Pharmacist Muna Ahmed
        },
        body: JSON.stringify({
          customerName: 'Woizero Aster Aweke',
          customerPhone: '+251 911 445 566',
          paymentMethod: 'TELEBIRR' as PaymentMethod,
          soldByUserId: 'u-munaa',
          items: [
            {
              medicineId: targetMedicine.id,
              quantity: 2,
              unitPrice: targetMedicine.sellingPrice || 250,
            },
          ],
        }),
      });

      expect(saleRes.status).toBe(201);
      const saleData = await saleRes.json();
      expect(saleData.success).toBe(true);
      expect(saleData.data.invoiceNumber).toBeDefined();
      expect(saleData.data.paymentMethod).toBe('TELEBIRR');

      // Verify stock was atomically decremented by 2
      const postSaleRes = await fetch(`${baseUrl}/api/medicines/${targetMedicine.id}`);
      const postSaleData = await postSaleRes.json();
      expect(postSaleData.data.medicine.totalStock).toBe(initialTotalStock - 2);
    });
  });
});
