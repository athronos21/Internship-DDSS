import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import { Server } from 'http';
import { startServer } from '../server';
import { db } from '../src/server/db';

describe('Medicine Registration Verification Suite', () => {
  let serverInstance: Server;
  const TEST_PORT = 5299;
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

  it('1. Rejects medicine registration when name is missing (HTTP 400)', async () => {
    const res = await fetch(`${baseUrl}/api/medicines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'u-1',
      },
      body: JSON.stringify({
        genericName: 'Paracetamol',
        strength: '500mg',
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('Medicine Name is required');
  });

  it('2. Successfully registers a new medicine with full EFDA details and initial batch (HTTP 201)', async () => {
    const testBarcode = `6281${Date.now().toString().slice(-8)}`;
    const testBatchNumber = `ETH-TEST-BAT-${Date.now().toString().slice(-4)}`;

    const payload = {
      name: 'Amoxicillin Trihydrate Clavulanate (Augmentin)',
      brandName: 'Augmentin ES',
      genericName: 'Amoxicillin + Clavulanic Acid',
      strength: '600mg / 42.9mg per 5ml',
      dosageForm: 'Oral Suspension',
      unit: 'Bottle (100ml)',
      manufacturer: 'GlaxoSmithKline (GSK)',
      barcode: testBarcode,
      sku: `MED-AUG-${Date.now().toString().slice(-4)}`,
      categoryId: 'cat-2',
      shelfLocation: 'Cold-Chain Fridge B (4°C)',
      prescriptionRequired: true,
      reorderLevel: 15,
      status: 'Active',
      initialBatch: {
        batchNumber: testBatchNumber,
        mfgDate: '2025-02-01',
        expDate: '2027-12-31',
        purchasePrice: 280.0,
        sellingPrice: 350.0,
        quantity: 50,
        supplierId: 'sup-1',
      },
    };

    const res = await fetch(`${baseUrl}/api/medicines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'u-2', // Pharmacist
      },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBeDefined();
    expect(body.data.name).toBe(payload.name);
    expect(body.data.barcode).toBe(testBarcode);

    // Verify batch was created and attached
    const createdBatch = db.medicineBatches.find((b) => b.batchNumber === testBatchNumber);
    expect(createdBatch).toBeDefined();
    expect(createdBatch?.medicineId).toBe(body.data.id);
    expect(createdBatch?.currentQuantity).toBe(50);
    expect(createdBatch?.sellingPrice).toBe(350.0);

    // Verify initial stock transaction was recorded in ledger
    const tx = db.inventoryTransactions.find((t) => t.batchNumber === testBatchNumber);
    expect(tx).toBeDefined();
    expect(tx?.transactionType).toBe('INITIAL_STOCK');
    expect(tx?.quantity).toBe(50);
    expect(tx?.performedBy).toBe('u-2');

    // Verify audit log
    const audit = db.auditLogs.find((a) => a.entityId === body.data.id);
    expect(audit).toBeDefined();
    expect(audit?.action).toBe('MEDICINE_CREATED');
  });

  it('3. Verifies registered medicine is immediately searchable by barcode for POS scanning', async () => {
    const testBarcode = `6281${Date.now().toString().slice(-8)}`;
    const payload = {
      name: 'Insulin Glargine (Lantus SoloStar)',
      brandName: 'Lantus',
      genericName: 'Insulin Glargine',
      strength: '100 units/ml (3ml pen)',
      dosageForm: 'Injectable Solution',
      barcode: testBarcode,
      shelfLocation: 'Vaccine & Cold-Chain Vault (3.4°C)',
      initialBatch: {
        batchNumber: `BAT-INS-${Date.now().toString().slice(-4)}`,
        expDate: '2027-06-30',
        purchasePrice: 650.0,
        sellingPrice: 780.0,
        quantity: 25,
      },
    };

    const createRes = await fetch(`${baseUrl}/api/medicines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'u-1' },
      body: JSON.stringify(payload),
    });
    expect(createRes.status).toBe(201);

    // Search by barcode
    const barcodeRes = await fetch(`${baseUrl}/api/medicines/barcode/${testBarcode}`);
    expect(barcodeRes.status).toBe(200);
    const barcodeBody = await barcodeRes.json();
    expect(barcodeBody.success).toBe(true);
    expect(barcodeBody.data.medicine.barcode).toBe(testBarcode);
    expect(barcodeBody.data.medicine.name).toBe(payload.name);
    expect(barcodeBody.data.medicine.totalStock).toBe(25);
    expect(barcodeBody.data.medicine.sellingPrice).toBe(780.0);
    expect(Array.isArray(barcodeBody.data.batches)).toBe(true);
    expect(barcodeBody.data.batches.length).toBe(1);
  });

  it('4. Verifies registered medicine appears in the calculated catalog list (/api/medicines)', async () => {
    const testName = `Azithromycin Dihydrate ${Date.now()}`;
    const payload = {
      name: testName,
      genericName: 'Azithromycin',
      strength: '500mg',
      dosageForm: 'Capsule',
      initialBatch: {
        batchNumber: `AZI-${Date.now().toString().slice(-4)}`,
        expDate: '2028-01-01',
        purchasePrice: 120.0,
        sellingPrice: 160.0,
        quantity: 80,
      },
    };

    const createRes = await fetch(`${baseUrl}/api/medicines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'u-1' },
      body: JSON.stringify(payload),
    });
    expect(createRes.status).toBe(201);

    // Query catalog
    const catalogRes = await fetch(`${baseUrl}/api/medicines`);
    expect(catalogRes.status).toBe(200);
    const catalogBody = await catalogRes.json();
    expect(catalogBody.success).toBe(true);

    const found = catalogBody.data.find((m: any) => m.name === testName);
    expect(found).toBeDefined();
    expect(found.totalStock).toBe(80);
    expect(found.sellingPrice).toBe(160.0);
  });

  it('5. Allows updating registered medicine metadata via PUT /api/medicines/:id', async () => {
    const testBarcode = `6281${Date.now().toString().slice(-8)}`;
    const createRes = await fetch(`${baseUrl}/api/medicines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Omeprazole Delayed-Release',
        barcode: testBarcode,
        shelfLocation: 'Shelf A-02',
      }),
    });
    const created = (await createRes.json()).data;

    // Update shelf location and strength
    const updateRes = await fetch(`${baseUrl}/api/medicines/${created.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shelfLocation: 'Shelf B-12 (Gastroenterology)',
        strength: '40mg',
      }),
    });
    expect(updateRes.status).toBe(200);
    const updateBody = await updateRes.json();
    expect(updateBody.success).toBe(true);
    expect(updateBody.data.shelfLocation).toBe('Shelf B-12 (Gastroenterology)');
    expect(updateBody.data.strength).toBe('40mg');
  });
});
