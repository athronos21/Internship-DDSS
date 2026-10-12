import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { startServer } from '../server';
import { db } from '../src/server/db';
import { auth, seedInitialBetterAuthUsers } from '../src/server/auth';
import type { Server } from 'http';

describe('POS Inventory Atomicity & Concurrency (POST /api/sales)', () => {
  const TEST_PORT = 5695;
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

  it('aggregates multiple cart lines for the same medicine and rejects atomically if total stock is exceeded', async () => {
    const med = db.getCalculatedMedicines().find((m) => (m.totalStock || 0) > 0)!;
    const initialStock = med.totalStock!;

    // Attempt to buy more than total stock using two lines
    const qty1 = Math.ceil(initialStock * 0.7);
    const qty2 = Math.ceil(initialStock * 0.6); // Total > initialStock

    const res = await fetch(`${baseUrl}/api/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cashierToken}`,
      },
      body: JSON.stringify({
        items: [
          { medicineId: med.id, quantity: qty1 },
          { medicineId: med.id, quantity: qty2 },
        ],
        paymentMethod: 'CASH',
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);

    // Verify ZERO stock was deducted (atomic rollback)
    const afterStock = db.getCalculatedMedicines().find((m) => m.id === med.id)!.totalStock;
    expect(afterStock).toBe(initialStock);
  });

  it('rolls back all earlier items if a subsequent cart item fails validation or stock', async () => {
    const meds = db.getCalculatedMedicines().filter((m) => (m.totalStock || 0) > 3);
    const med1 = meds[0];
    const med2 = meds[1];

    const initialStock1 = med1.totalStock!;
    const initialStock2 = med2.totalStock!;

    const res = await fetch(`${baseUrl}/api/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cashierToken}`,
      },
      body: JSON.stringify({
        items: [
          { medicineId: med1.id, quantity: 2 },
          { medicineId: med2.id, quantity: 9999 }, // Will fail on med2
        ],
        paymentMethod: 'CASH',
      }),
    });

    expect(res.status).toBe(400);

    // Verify med1 stock was NOT deducted
    const afterStock1 = db.getCalculatedMedicines().find((m) => m.id === med1.id)!.totalStock;
    const afterStock2 = db.getCalculatedMedicines().find((m) => m.id === med2.id)!.totalStock;

    expect(afterStock1).toBe(initialStock1);
    expect(afterStock2).toBe(initialStock2);
  });
});
