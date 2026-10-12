import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { startServer } from '../server';
import { db } from '../src/server/db';
import { auth, seedInitialBetterAuthUsers } from '../src/server/auth';
import type { Server } from 'http';

describe('Public Order Integrity & Lifecycle (POST /api/orders)', () => {
  const TEST_PORT = 5696;
  const baseUrl = `http://localhost:${TEST_PORT}`;
  let serverInstance: Server;
  let pharmacistToken: string = '';

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await seedInitialBetterAuthUsers();
    const result = await startServer(TEST_PORT);
    serverInstance = result.server;

    const signin = await auth.api.signInEmail({
      body: { email: 'monet@kaziniya.com', password: 'Password123!' },
    });
    pharmacistToken = signin.token;
  });

  afterAll(() => {
    serverInstance?.close();
  });

  it('POST /api/orders recalculates totalAmount from medicine catalog prices', async () => {
    const med = db.getCalculatedMedicines().find((m) => (m.totalStock || 0) > 0)!;
    const catalogPrice = med.sellingPrice!;
    expect(catalogPrice).toBeGreaterThan(0);

    const res = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Online Patient',
        phone: '+251 911 556 778',
        items: [{ medicineId: med.id, quantity: 2, unitPrice: 0.5 }], // Tampered client price
        totalAmount: 1, // Tampered total
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.totalAmount).toBe(catalogPrice * 2);
    expect(body.data.items[0].unitPrice).toBe(catalogPrice);
  });

  it('POST /api/orders rejects invalid medicine ID with 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Patient',
        phone: '+251 911 000 000',
        items: [{ medicineId: 'non-existent-medicine-id', quantity: 1 }],
      }),
    });
    expect(res.status).toBe(400);
  });

  it('PATCH /api/orders/:id blocks invalid status transition with 400 Bad Request', async () => {
    const med = db.getCalculatedMedicines()[0];
    const createRes = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Transition Test Patient',
        phone: '+251 911 112 233',
        items: [{ medicineId: med.id, quantity: 1 }],
      }),
    });
    const order = (await createRes.json()).data;

    // First cancel the order
    const cancelRes = await fetch(`${baseUrl}/api/orders/${order.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmacistToken}`,
      },
      body: JSON.stringify({ orderStatus: 'CANCELLED' }),
    });
    expect(cancelRes.status).toBe(200);

    // Attempt invalid transition: CANCELLED -> DISPENSED
    const invalidRes = await fetch(`${baseUrl}/api/orders/${order.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmacistToken}`,
      },
      body: JSON.stringify({ orderStatus: 'DISPENSED' }),
    });
    expect(invalidRes.status).toBe(400);
  });
});
