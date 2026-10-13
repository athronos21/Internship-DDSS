import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import { Server } from 'http';
import { startServer } from '../server';

import { auth, seedInitialBetterAuthUsers } from '../src/server/auth';

describe('Real-Time Store Alerts & Notifications System', () => {
  let serverInstance: Server;
  const TEST_PORT = 5592;
  const baseUrl = `http://localhost:${TEST_PORT}`;

  let storeOwnerToken: string;
  let pharmacistToken: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await seedInitialBetterAuthUsers();
    const result = await startServer(TEST_PORT);
    serverInstance = result.server;

    // Login Store Owner (kaziniya@kaziniya.com)
    const ownerRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'kaziniya@kaziniya.com',
        password: 'Password123!',
      }),
    });
    const ownerData = await ownerRes.json();
    storeOwnerToken = ownerData.token;

    // Login Pharmacist (monet@kaziniya.com)
    const pharmRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'monet@kaziniya.com',
        password: 'Password123!',
      }),
    });
    const pharmData = await pharmRes.json();
    pharmacistToken = pharmData.token;
  });

  afterAll((done) => {
    if (serverInstance) {
      serverInstance.close(() => done());
    } else {
      done();
    }
  });

  // 1. Unauthenticated Security Checks
  it('rejects unauthenticated GET /api/notifications/alerts with 401', async () => {
    const res = await fetch(`${baseUrl}/api/notifications/alerts`);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('rejects unauthenticated GET /api/alerts alias with 401', async () => {
    const res = await fetch(`${baseUrl}/api/alerts`);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('rejects unauthenticated POST /api/notifications/dismiss with 401', async () => {
    const res = await fetch(`${baseUrl}/api/notifications/dismiss`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alertId: 'some-id' }),
    });
    expect(res.status).toBe(401);
  });

  // 2. Role-Based Access for Staff
  it('allows authenticated STORE_OWNER to fetch store alerts with 200', async () => {
    const res = await fetch(`${baseUrl}/api/notifications/alerts`, {
      headers: { Authorization: `Bearer ${storeOwnerToken}` },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(typeof body.data.totalAlertCount).toBe('number');
    expect(Array.isArray(body.data.alerts)).toBe(true);
  });

  it('allows authenticated PHARMACIST to access inventory alerts without 403', async () => {
    const res = await fetch(`${baseUrl}/api/notifications/alerts`, {
      headers: { Authorization: `Bearer ${pharmacistToken}` },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.totalAlertCount).toBeGreaterThanOrEqual(0);
  });

  // 3. Payload Structure & Alert Semantics
  it('returns valid metadata for each active store alert', async () => {
    const res = await fetch(`${baseUrl}/api/notifications/alerts`, {
      headers: { Authorization: `Bearer ${storeOwnerToken}` },
    });
    const body = await res.json();
    const alerts = body.data.alerts;

    if (alerts.length > 0) {
      const first = alerts[0];
      expect(first.id).toBeDefined();
      expect(first.title).toBeDefined();
      expect(first.message).toBeDefined();
      expect(['warning', 'danger', 'info']).toContain(first.type);
      expect(['LOW_STOCK', 'EXPIRING_SOON', 'EXPIRED', 'OUT_OF_STOCK']).toContain(first.category);
      expect(['inventory', 'batch_mgmt']).toContain(first.actionTarget);
    }
  });

  // 4. Dismissal and Reset Lifecycle
  it('supports dismissing single alert and decrements alert count', async () => {
    // Reset dismissals first
    await fetch(`${baseUrl}/api/notifications/reset`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${storeOwnerToken}` },
    });

    const initialRes = await fetch(`${baseUrl}/api/notifications/alerts`, {
      headers: { Authorization: `Bearer ${storeOwnerToken}` },
    });
    const initialData = await initialRes.json();
    const initialCount = initialData.data.totalAlertCount;

    if (initialCount > 0) {
      const alertToDismiss = initialData.data.alerts[0].id;

      const dismissRes = await fetch(`${baseUrl}/api/notifications/dismiss`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storeOwnerToken}`,
        },
        body: JSON.stringify({ alertId: alertToDismiss }),
      });
      expect(dismissRes.status).toBe(200);
      const dismissData = await dismissRes.json();
      expect(dismissData.data.totalAlertCount).toBe(initialCount - 1);
      expect(dismissData.data.alerts.some((a: any) => a.id === alertToDismiss)).toBe(false);
    }
  });

  it('supports clearing all alerts and resetting dismissals', async () => {
    const clearRes = await fetch(`${baseUrl}/api/notifications/dismiss`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${storeOwnerToken}`,
      },
      body: JSON.stringify({ clearAll: true }),
    });
    expect(clearRes.status).toBe(200);
    const clearData = await clearRes.json();
    expect(clearData.data.totalAlertCount).toBe(0);
    expect(clearData.data.alerts.length).toBe(0);

    // Reset dismissals
    const resetRes = await fetch(`${baseUrl}/api/notifications/reset`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${storeOwnerToken}` },
    });
    expect(resetRes.status).toBe(200);
    const resetData = await resetRes.json();
    expect(resetData.data.totalAlertCount).toBeGreaterThan(0);
  });
});
