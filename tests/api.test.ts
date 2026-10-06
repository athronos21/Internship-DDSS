import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import { Server } from 'http';
import { startServer } from '../server';
import { db } from '../src/server/db';

describe('API Endpoints & Integration Suite', () => {
  let serverInstance: Server;
  const TEST_PORT = 5188;
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

  describe('System & Health Check', () => {
    it('GET /health returns 200 and operational status', async () => {
      const res = await fetch(`${baseUrl}/health`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('ok');
      expect(data.service).toContain('Kaziniya');
      expect(data.timestamp).toBeDefined();
    });
  });

  describe('Authentication & RBAC Endpoints', () => {
    it('GET /api/auth/me returns authenticated user session, effective role and permissions', async () => {
      const res = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { 'x-user-id': 'u-1' },
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.role).toBe('STORE_OWNER');
      expect(Array.isArray(body.permissions)).toBe(true);
      expect(body.pharmacy).toBeDefined();
    });

    it('GET /api/auth/role-matrix returns canonical 3-tier matrix and domains', async () => {
      const res = await fetch(`${baseUrl}/api/auth/role-matrix`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.roles.SUPER_ADMIN).toBeDefined();
      expect(body.roles.STORE_OWNER).toBeDefined();
      expect(body.roles.PHARMACIST).toBeDefined();
      expect(Array.isArray(body.domains)).toBe(true);
    });

    it('Enforces RBAC security: Pharmacist is forbidden from updating pharmacy profile (403)', async () => {
      const res = await fetch(`${baseUrl}/api/pharmacy/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'u-2', // Pharmacist
        },
        body: JSON.stringify({ storeSlogan: 'Unauthorized Slogan Change' }),
      });
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe('FORBIDDEN_ROLE');
    });

    it('Allows Store Owner to update pharmacy profile (200)', async () => {
      const res = await fetch(`${baseUrl}/api/pharmacy/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'u-1', // Store Owner
        },
        body: JSON.stringify({ storeSlogan: 'Authorized Owner Slogan' }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });
  });

  describe('Pharmacy Fleet & Master Network', () => {
    it('GET /api/pharmacy/profile returns active store profile', async () => {
      const res = await fetch(`${baseUrl}/api/pharmacy/profile`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.storeName).toBeDefined();
      expect(body.data.tinNumber).toBeDefined();
    });

    it('GET /api/fleet/pharmacies returns nationwide registered pharmacies', async () => {
      const res = await fetch(`${baseUrl}/api/fleet/pharmacies`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Catalog: Medicines, Batches, Categories & Suppliers', () => {
    it('GET /api/categories returns product categories', async () => {
      const res = await fetch(`${baseUrl}/api/categories`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/suppliers returns licensed suppliers', async () => {
      const res = await fetch(`${baseUrl}/api/suppliers`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('GET /api/medicines returns calculated medicines with stock counts', async () => {
      const res = await fetch(`${baseUrl}/api/medicines`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);

      const firstMed = body.data[0];
      expect(firstMed.id).toBeDefined();
      expect(firstMed.name).toBeDefined();
    });

    it('GET /api/batches returns batches with expiration status', async () => {
      const res = await fetch(`${baseUrl}/api/batches`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Point of Sale & Inventory Transactions', () => {
    let createdInvoiceNumber = '';

    it('POST /api/sales successfully executes sale and records transaction', async () => {
      const med = db.getCalculatedMedicines().find((m) => (m.totalStock || 0) >= 3);
      expect(med).toBeDefined();

      const res = await fetch(`${baseUrl}/api/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'u-2', // Pharmacist
        },
        body: JSON.stringify({
          items: [{ medicineId: med!.id, quantity: 1, unitPrice: 40 }],
          paymentMethod: 'CASH',
          customerName: 'Integration Test Patient',
          discount: 0,
        }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.invoiceNumber).toBeDefined();
      expect(body.data.totalAmount).toBe(40);
      createdInvoiceNumber = body.data.invoiceNumber;
    });

    it('GET /api/sales returns recorded sales invoices', async () => {
      const res = await fetch(`${baseUrl}/api/sales`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/sales/:id retrieves single invoice by ID or invoice number', async () => {
      expect(createdInvoiceNumber).toBeDefined();
      const res = await fetch(`${baseUrl}/api/sales/${createdInvoiceNumber}`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.invoiceNumber).toBe(createdInvoiceNumber);
    });

    it('POST /api/inventory/adjust performs authorized stock adjustment', async () => {
      const batch = db.medicineBatches[0];
      const prevQty = batch.currentQuantity;

      const res = await fetch(`${baseUrl}/api/inventory/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'u-1',
        },
        body: JSON.stringify({
          medicineId: batch.medicineId,
          batchId: batch.id,
          transactionType: 'ADJUSTMENT',
          quantityDelta: 5,
          notes: 'API integration inventory reconciliation test',
        }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.newQuantity).toBe(prevQty + 5);
    });

    it('GET /api/reports/stock-movement returns transaction audit trail', async () => {
      const res = await fetch(`${baseUrl}/api/reports/stock-movement`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Purchases & Replenishment', () => {
    it('GET /api/purchases returns purchase orders', async () => {
      const res = await fetch(`${baseUrl}/api/purchases`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('POST /api/purchases creates restock order', async () => {
      const med = db.medicines[0];
      const sup = db.suppliers[0];

      const res = await fetch(`${baseUrl}/api/purchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'u-1',
        },
        body: JSON.stringify({
          supplierId: sup.id,
          invoiceNumber: `PUR-API-${Date.now()}`,
          purchaseDate: new Date().toISOString().split('T')[0],
          items: [
            {
              medicineId: med.id,
              batchNumber: `BAT-API-${Date.now()}`,
              mfgDate: '2025-01-01',
              expDate: '2028-12-31',
              quantity: 20,
              unitCost: 10,
              sellingPrice: 18,
            },
          ],
        }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.totalAmount).toBe(200);
    });
  });

  describe('Analytics & AI Demand Forecasting', () => {
    it('GET /api/dashboard returns executive KPIs, stock health, and sales trend', async () => {
      const res = await fetch(`${baseUrl}/api/dashboard`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.totalMedicinesCount).toBeGreaterThan(0);
      expect(Array.isArray(body.data.salesTrend)).toBe(true);
    });

    it('GET /api/analytics/ml-forecast returns ML demand forecast', async () => {
      const res = await fetch(`${baseUrl}/api/analytics/ml-forecast`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.items).toBeDefined();
      expect(body.data.items.length).toBeGreaterThan(0);
      expect(body.data.totalSuggestedReorderUnits).toBeDefined();
    });

    it('GET /api/reports/profit returns profit and loss breakdown', async () => {
      const res = await fetch(`${baseUrl}/api/reports/profit`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(typeof body.data.totalRevenue).toBe('number');
      expect(typeof body.data.cogs).toBe('number');
    });
  });

  describe('OCR Pharma Packaging Parser Endpoint', () => {
    it('POST /api/gemini/scan-medicine extracts commercial drug details from OCR text', async () => {
      const sampleOcr = `
        AUGMENTIN 625mg
        Amoxicillin + Clavulanic Acid
        GlaxoSmithKline
        Batch: AG-9901
        EXP: 08/2027
      `;
      const res = await fetch(`${baseUrl}/api/gemini/scan-medicine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
          ocrText: sampleOcr,
        }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.name).toContain('AUGMENTIN');
      expect(body.data.batchNumber).toBe('AG-9901');
      expect(body.data.expDate).toBe('2027-08-31');
    });
  });

  describe('JSON 404 Fallback for Non-Existent Routes', () => {
    it('Returns JSON 404 instead of HTML for unhandled /api/* endpoints', async () => {
      const res = await fetch(`${baseUrl}/api/non-existent-endpoint-${Date.now()}`);
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.message).toContain('API endpoint not found');
    });
  });
});
