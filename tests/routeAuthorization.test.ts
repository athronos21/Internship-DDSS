import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import { Server } from 'http';
import { startServer } from '../server';

describe('Route Authorization Matrix', () => {
  let serverInstance: Server;
  const TEST_PORT = 5588;
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

  it('allows public access to GET /health', async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
  });

  it('allows public access to GET /api/categories', async () => {
    const res = await fetch(`${baseUrl}/api/categories`);
    expect(res.status).toBe(200);
  });

  it('blocks anonymous access to POST /api/sales with 401', async () => {
    const res = await fetch(`${baseUrl}/api/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ medicineId: 'med-1', quantity: 1, unitPrice: 50 }],
      }),
    });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('blocks anonymous access to POST /api/inventory/adjust with 401', async () => {
    const res = await fetch(`${baseUrl}/api/inventory/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        medicineId: 'med-1',
        batchId: 'batch-1',
        transactionType: 'ADJUSTMENT',
        quantityDelta: 2,
      }),
    });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('blocks anonymous access to POST /api/purchases with 401', async () => {
    const res = await fetch(`${baseUrl}/api/purchases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplierId: 'sup-1',
        items: [],
      }),
    });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('blocks anonymous access to GET /api/reports/profit with 401', async () => {
    const res = await fetch(`${baseUrl}/api/reports/profit`);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('blocks anonymous access to GET /api/reports/stock-movement with 401', async () => {
    const res = await fetch(`${baseUrl}/api/reports/stock-movement`);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });
});
