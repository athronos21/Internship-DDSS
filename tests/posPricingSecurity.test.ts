import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { startServer } from '../server';
import { db } from '../src/server/db';
import { auth, seedInitialBetterAuthUsers } from '../src/server/auth';
import type { Server } from 'http';

describe('POS Pricing & Quantity Security (POST /api/sales)', () => {
  const TEST_PORT = 5694;
  const baseUrl = `http://localhost:${TEST_PORT}`;
  let serverInstance: Server;
  let cashierToken: string = '';

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await seedInitialBetterAuthUsers();
    const result = await startServer(TEST_PORT);
    serverInstance = result.server;

    const signin = await auth.api.signInEmail({
      body: { email: 'monet@kaziniya.com', password: 'Password123!' },
    });
    cashierToken = signin.token;
  });

  afterAll(() => {
    serverInstance?.close();
  });

  it('rejects sale with zero or negative quantity with 400 Bad Request', async () => {
    const med = db.getCalculatedMedicines().find((m) => (m.totalStock || 0) > 0)!;
    const res = await fetch(`${baseUrl}/api/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cashierToken}`,
      },
      body: JSON.stringify({
        items: [{ medicineId: med.id, quantity: -2 }],
        paymentMethod: 'CASH',
      }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('rejects sale with non-integer floating quantity with 400 Bad Request', async () => {
    const med = db.getCalculatedMedicines().find((m) => (m.totalStock || 0) > 0)!;
    const res = await fetch(`${baseUrl}/api/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cashierToken}`,
      },
      body: JSON.stringify({
        items: [{ medicineId: med.id, quantity: 2.5 }],
        paymentMethod: 'CASH',
      }),
    });
    expect(res.status).toBe(400);
  });

  it('ignores client unit price and derives price strictly from batch sellingPrice', async () => {
    const med = db.getCalculatedMedicines().find((m) => (m.totalStock || 0) > 2)!;
    const expectedBatchPrice = med.sellingPrice!;
    expect(expectedBatchPrice).toBeGreaterThan(0);

    const res = await fetch(`${baseUrl}/api/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cashierToken}`,
      },
      body: JSON.stringify({
        items: [{ medicineId: med.id, quantity: 1, unitPrice: 0.01 }], // Tampered unit price
        paymentMethod: 'CASH',
        customerName: 'Tamper Test Customer',
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.items[0].unitPrice).toBe(expectedBatchPrice);
    expect(body.data.totalAmount).toBe(expectedBatchPrice);
  });

  it('rejects overall cart discount exceeding 20% limit with 400 Bad Request', async () => {
    const med = db.getCalculatedMedicines().find((m) => (m.totalStock || 0) > 0)!;
    const subtotal = med.sellingPrice!;

    const res = await fetch(`${baseUrl}/api/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cashierToken}`,
      },
      body: JSON.stringify({
        items: [{ medicineId: med.id, quantity: 1 }],
        paymentMethod: 'CASH',
        discount: subtotal * 0.5, // 50% discount exceeds 20% limit
      }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('accepts valid sale with discount <= 20% and calculates total accurately', async () => {
    const med = db.getCalculatedMedicines().find((m) => (m.totalStock || 0) > 0)!;
    const expectedPrice = med.sellingPrice!;
    const allowableDiscount = Math.round(expectedPrice * 0.1 * 100) / 100; // 10% discount

    const res = await fetch(`${baseUrl}/api/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cashierToken}`,
      },
      body: JSON.stringify({
        items: [{ medicineId: med.id, quantity: 1 }],
        paymentMethod: 'CASH',
        discount: allowableDiscount,
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.totalAmount).toBe(Math.round((expectedPrice - allowableDiscount) * 100) / 100);
  });
});
