import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import { Server } from 'http';
import { startServer } from '../server';
import { db } from '../src/server/db';
import { auth, seedInitialBetterAuthUsers } from '../src/server/auth';

describe('Medicine Registration Verification Suite', () => {
  let serverInstance: Server;
  const TEST_PORT = 5299;
  const baseUrl = `http://localhost:${TEST_PORT}`;
  let ownerToken: string = '';

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await seedInitialBetterAuthUsers();
    const result = await startServer(TEST_PORT);
    serverInstance = result.server;

    const ownerSignin = await auth.api.signInEmail({
      body: { email: 'kaziniya@kaziniya.com', password: 'Password123!' },
    });
    ownerToken = ownerSignin.token;
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
        Authorization: `Bearer ${ownerToken}`,
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
        Authorization: `Bearer ${ownerToken}`,
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
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
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
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
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
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
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
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
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

  it('6. Rejects medicine registration when name is shorter than 2 characters (HTTP 400)', async () => {
    const res = await fetch(`${baseUrl}/api/medicines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        name: 'A',
      }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('must be at least 2 characters');
  });

  it('7. Rejects medicine registration with negative reorder level (HTTP 400)', async () => {
    const res = await fetch(`${baseUrl}/api/medicines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        name: 'Salbutamol Inhaler',
        reorderLevel: -5,
      }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('Reorder level must be a non-negative number');
  });

  it('8. Rejects barcode collision across distinct medicines with HTTP 409 Conflict', async () => {
    const sharedBarcode = `6281${Date.now().toString().slice(-8)}`;

    // Create first medicine
    const firstRes = await fetch(`${baseUrl}/api/medicines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        name: 'Original Ciprofloxacin 500mg',
        barcode: sharedBarcode,
      }),
    });
    expect(firstRes.status).toBe(201);

    // Attempt second medicine with same barcode
    const secondRes = await fetch(`${baseUrl}/api/medicines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        name: 'Distinct Amoxicillin 500mg',
        barcode: sharedBarcode,
      }),
    });
    expect(secondRes.status).toBe(409);
    const body = await secondRes.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('already assigned to medicine');
  });

  it('9. Rejects initial batch with empty batch / lot number (HTTP 400)', async () => {
    const res = await fetch(`${baseUrl}/api/medicines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        name: 'Metformin HCl 850mg',
        initialBatch: {
          batchNumber: '   ',
          quantity: 100,
          purchasePrice: 15,
          sellingPrice: 25,
        },
      }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('Batch / Lot number is required');
  });

  it('10. Rejects initial batch with invalid quantity (HTTP 400)', async () => {
    // 0 quantity
    const zeroRes = await fetch(`${baseUrl}/api/medicines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        name: 'Ibuprofen 400mg',
        initialBatch: {
          batchNumber: 'BAT-IBU-001',
          quantity: 0,
          purchasePrice: 10,
          sellingPrice: 20,
        },
      }),
    });
    expect(zeroRes.status).toBe(400);
    const zeroBody = await zeroRes.json();
    expect(zeroBody.message).toContain('Initial batch quantity must be a positive integer');

    // Negative quantity
    const negRes = await fetch(`${baseUrl}/api/medicines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        name: 'Ibuprofen 400mg',
        initialBatch: {
          batchNumber: 'BAT-IBU-002',
          quantity: -10,
          purchasePrice: 10,
          sellingPrice: 20,
        },
      }),
    });
    expect(negRes.status).toBe(400);

    // Non-integer quantity
    const floatRes = await fetch(`${baseUrl}/api/medicines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        name: 'Ibuprofen 400mg',
        initialBatch: {
          batchNumber: 'BAT-IBU-003',
          quantity: 12.5,
          purchasePrice: 10,
          sellingPrice: 20,
        },
      }),
    });
    expect(floatRes.status).toBe(400);
  });

  it('11. Rejects initial batch with negative purchase price or selling price (HTTP 400)', async () => {
    // Negative cost
    const negCostRes = await fetch(`${baseUrl}/api/medicines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        name: 'Paracetamol Syrup 120mg',
        initialBatch: {
          batchNumber: 'BAT-PARA-NEG1',
          quantity: 50,
          purchasePrice: -5,
          sellingPrice: 20,
        },
      }),
    });
    expect(negCostRes.status).toBe(400);
    const costBody = await negCostRes.json();
    expect(costBody.message).toContain('Purchase price (unit cost) cannot be negative');

    // Negative selling price
    const negPriceRes = await fetch(`${baseUrl}/api/medicines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        name: 'Paracetamol Syrup 120mg',
        initialBatch: {
          batchNumber: 'BAT-PARA-NEG2',
          quantity: 50,
          purchasePrice: 10,
          sellingPrice: -1,
        },
      }),
    });
    expect(negPriceRes.status).toBe(400);
    const priceBody = await negPriceRes.json();
    expect(priceBody.message).toContain('Selling price cannot be negative');
  });

  it('12. Rejects selling price lower than purchase cost (anti-loss guard) (HTTP 400)', async () => {
    const res = await fetch(`${baseUrl}/api/medicines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        name: 'Doxycycline 100mg',
        initialBatch: {
          batchNumber: 'BAT-DOX-LOSS',
          quantity: 50,
          purchasePrice: 100,
          sellingPrice: 75, // Lower than 100 ETB cost
        },
      }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('Dispensing at a loss is prohibited');
  });

  it('13. Rejects batch when expiry date is on or before manufacturing date (EFDA check) (HTTP 400)', async () => {
    const res = await fetch(`${baseUrl}/api/medicines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        name: 'Ceftriaxone 1g Vial',
        initialBatch: {
          batchNumber: 'BAT-CEF-INVALID-DATE',
          quantity: 20,
          purchasePrice: 150,
          sellingPrice: 200,
          mfgDate: '2027-01-01',
          expDate: '2026-01-01', // Before mfgDate
        },
      }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('must be strictly after manufacturing date');
  });

  it('14. Rejects stocking already-expired medicine (HTTP 400)', async () => {
    const res = await fetch(`${baseUrl}/api/medicines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        name: 'Diclofenac Gel 1%',
        initialBatch: {
          batchNumber: 'BAT-DIC-EXPIRED',
          quantity: 15,
          purchasePrice: 80,
          sellingPrice: 120,
          mfgDate: '2020-01-01',
          expDate: '2023-01-01', // In the past
        },
      }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('Expired medicine cannot be stocked');
  });

  it('15. Rejects PUT /api/medicines/:id with conflicting barcode, invalid name, or negative reorder level', async () => {
    const barcode1 = `6281${Date.now().toString().slice(-8)}`;
    const barcode2 = `6282${Date.now().toString().slice(-8)}`;

    const med1Res = await fetch(`${baseUrl}/api/medicines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({ name: 'First Medicine Med1', barcode: barcode1 }),
    });
    const med1 = (await med1Res.json()).data;

    const med2Res = await fetch(`${baseUrl}/api/medicines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({ name: 'Second Medicine Med2', barcode: barcode2 }),
    });
    const med2 = (await med2Res.json()).data;

    // 1. Conflict barcode on PUT
    const conflictRes = await fetch(`${baseUrl}/api/medicines/${med2.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({ barcode: barcode1 }),
    });
    expect(conflictRes.status).toBe(409);

    // 2. Short name on PUT
    const shortNameRes = await fetch(`${baseUrl}/api/medicines/${med1.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({ name: ' ' }),
    });
    expect(shortNameRes.status).toBe(400);

    // 3. Negative reorderLevel on PUT
    const negRlRes = await fetch(`${baseUrl}/api/medicines/${med1.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({ reorderLevel: -10 }),
    });
    expect(negRlRes.status).toBe(400);
  });
});
