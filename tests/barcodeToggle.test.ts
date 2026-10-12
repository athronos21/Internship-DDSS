import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import { Server } from 'http';
import { startServer } from '../server';
import { auth, seedInitialBetterAuthUsers } from '../src/server/auth';

describe('Store Owner Barcode Feature Toggle Switch (Task 4)', () => {
  let serverInstance: Server;
  const TEST_PORT = 5392;
  const baseUrl = `http://localhost:${TEST_PORT}`;
  let pharmToken: string = '';
  let ownerToken: string = '';

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await seedInitialBetterAuthUsers();
    const result = await startServer(TEST_PORT);
    serverInstance = result.server;

    const pharmSignin = await auth.api.signInEmail({
      body: { email: 'monet@kaziniya.com', password: 'Password123!' },
    });
    pharmToken = pharmSignin.token;

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

  it('1. GET /api/pharmacy/profile includes enableBarcodeSystem boolean property', async () => {
    const res = await fetch(`${baseUrl}/api/pharmacy/profile`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(typeof data.data.enableBarcodeSystem).toBe('boolean');
  });

  it('2. Rejects barcode toggle update when non-authorized user attempts modification', async () => {
    const res = await fetch(`${baseUrl}/api/pharmacy/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmToken}`,
      },
      body: JSON.stringify({ enableBarcodeSystem: true }),
    });

    // roleGuard blocks non-owner/non-superadmin
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it('3. Allows Store Owner to activate the barcode subsystem (ON switch)', async () => {
    const res = await fetch(`${baseUrl}/api/pharmacy/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({ enableBarcodeSystem: true }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.enableBarcodeSystem).toBe(true);

    // Verify persistence via GET
    const verifyRes = await fetch(`${baseUrl}/api/pharmacy/profile`);
    const verifyData = await verifyRes.json();
    expect(verifyData.data.enableBarcodeSystem).toBe(true);
  });

  it('4. Allows Store Owner to deactivate the barcode subsystem (OFF switch)', async () => {
    const res = await fetch(`${baseUrl}/api/pharmacy/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({ enableBarcodeSystem: false }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.enableBarcodeSystem).toBe(false);

    // Verify persistence via GET
    const verifyRes = await fetch(`${baseUrl}/api/pharmacy/profile`);
    const verifyData = await verifyRes.json();
    expect(verifyData.data.enableBarcodeSystem).toBe(false);
  });

  it('5. Verifies audit trail records store configuration updates', async () => {
    const res = await fetch(`${baseUrl}/api/audit-logs`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);

    const profileLog = data.data.find((log: any) => log.action === 'PHARMACY_PROFILE_UPDATED');
    expect(profileLog).toBeDefined();
  });
});
