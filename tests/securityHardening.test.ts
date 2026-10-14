import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import { Server } from 'http';
import { startServer } from '../server';
import { auth, seedInitialBetterAuthUsers } from '../src/server/auth';
import { db } from '../src/server/db';

describe('Comprehensive Security Hardening & Regression Suite', () => {
  let serverInstance: Server;
  const TEST_PORT = 5788;
  const baseUrl = `http://localhost:${TEST_PORT}`;

  let pharmacistToken: string = '';
  let ownerToken: string = '';
  let adminToken: string = '';

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await seedInitialBetterAuthUsers();
    const result = await startServer(TEST_PORT);
    serverInstance = result.server;

    // Sign in as Pharmacist (monet@kaziniya.com / Password123!)
    const pharmSignin = await auth.api.signInEmail({
      body: { email: 'monet@kaziniya.com', password: 'Password123!' },
    });
    pharmacistToken = pharmSignin.token;

    // Sign in as Store Owner (kaziniya@kaziniya.com / Password123!)
    const ownerSignin = await auth.api.signInEmail({
      body: { email: 'kaziniya@kaziniya.com', password: 'Password123!' },
    });
    ownerToken = ownerSignin.token;

    // Sign in as Super Admin (athronos21@gmail.com / Password123!)
    const adminSignin = await auth.api.signInEmail({
      body: { email: 'athronos21@gmail.com', password: 'Password123!' },
    });
    adminToken = adminSignin.token;
  });

  afterAll((done) => {
    if (serverInstance) {
      serverInstance.close(() => done());
    } else {
      done();
    }
  });

  describe('1. Public Endpoints Accessibility', () => {
    it('GET /health returns 200 without authentication', async () => {
      const res = await fetch(`${baseUrl}/health`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('ok');
    });

    it('GET /api/categories returns 200 without authentication', async () => {
      const res = await fetch(`${baseUrl}/api/categories`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('GET /api/medicines returns 200 without authentication (catalog browsing)', async () => {
      const res = await fetch(`${baseUrl}/api/medicines`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('2. Unauthenticated Access Rejection (401)', () => {
    it('blocks anonymous POST /api/sales with 401', async () => {
      const res = await fetch(`${baseUrl}/api/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [] }),
      });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it('blocks anonymous POST /api/inventory/adjust with 401', async () => {
      const res = await fetch(`${baseUrl}/api/inventory/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicineId: 'med-1', quantityDelta: 1 }),
      });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it('blocks anonymous POST /api/purchases with 401', async () => {
      const res = await fetch(`${baseUrl}/api/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierId: 'sup-1', items: [] }),
      });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it('blocks anonymous GET /api/reports/profit with 401', async () => {
      const res = await fetch(`${baseUrl}/api/reports/profit`);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it('blocks anonymous GET /api/dashboard with 401', async () => {
      const res = await fetch(`${baseUrl}/api/dashboard`);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it('blocks anonymous POST /api/auth/change-password with 401', async () => {
      const res = await fetch(`${baseUrl}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: 'NewPassword123!' }),
      });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
    });
  });

  describe('3. Spoofing Attack Mitigation', () => {
    it('rejects forged x-user-id: u-superadmin with 401', async () => {
      const res = await fetch(`${baseUrl}/api/reports/profit`, {
        headers: { 'x-user-id': 'u-superadmin' },
      });
      expect(res.status).toBe(401);
    });

    it('rejects invalid Bearer token with 401', async () => {
      const res = await fetch(`${baseUrl}/api/reports/profit`, {
        headers: { Authorization: 'Bearer forged-malicious-token-xyz' },
      });
      expect(res.status).toBe(401);
    });
  });

  describe('4. Role Privilege Isolation', () => {
    it('Pharmacist CANNOT access financial profit reports (403)', async () => {
      const res = await fetch(`${baseUrl}/api/reports/profit`, {
        headers: { Authorization: `Bearer ${pharmacistToken}` },
      });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('FORBIDDEN_ROLE');
    });

    it('Pharmacist CAN register new medicines (201) as authorized by Store Owner', async () => {
      const uniqueBarcode = `6281${Date.now().toString().slice(-8)}`;
      const res = await fetch(`${baseUrl}/api/medicines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${pharmacistToken}`,
        },
        body: JSON.stringify({
          name: 'Pharmacist Registered Drug',
          brandName: 'PharmDrug',
          dosageForm: 'Tablet',
          strength: '250mg',
          barcode: uniqueBarcode,
          initialBatch: {
            batchNumber: `BAT-PHARM-${Date.now().toString().slice(-4)}`,
            quantity: 20,
            purchasePrice: 20,
            sellingPrice: 35,
            mfgDate: '2025-01-01',
            expDate: '2028-01-01',
          },
        }),
      });
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBeDefined();
    });

    it('Pharmacist CANNOT delete or permanently drop medicines (403)', async () => {
      const res = await fetch(`${baseUrl}/api/medicines/med-1`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${pharmacistToken}`,
        },
      });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('FORBIDDEN_ROLE');
    });

    it('Pharmacist CAN execute point of sale (201)', async () => {
      const med = db.getCalculatedMedicines().find((m) => (m.totalStock || 0) >= 2);
      expect(med).toBeDefined();

      const res = await fetch(`${baseUrl}/api/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${pharmacistToken}`,
        },
        body: JSON.stringify({
          items: [{ medicineId: med!.id, quantity: 1, unitPrice: 50 }],
          paymentMethod: 'CASH',
          customerName: 'Regression Test Patient',
        }),
      });
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.invoiceNumber).toBeDefined();
    });

    it('Store Owner CAN access financial profit reports (200)', async () => {
      const res = await fetch(`${baseUrl}/api/reports/profit`, {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it('Super Admin has master override across all secured endpoints (200)', async () => {
      const res = await fetch(`${baseUrl}/api/reports/profit`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });
});
