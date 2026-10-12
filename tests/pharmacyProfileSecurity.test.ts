import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { startServer } from '../server';
import { db } from '../src/server/db';
import { auth } from '../src/server/auth';
import type { Server } from 'http';

describe('Pharmacy Profile Privacy (/api/pharmacy/profile)', () => {
  const TEST_PORT = 5693;
  const baseUrl = `http://localhost:${TEST_PORT}`;
  let serverInstance: Server;
  let ownerToken: string = '';

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const result = await startServer(TEST_PORT);
    serverInstance = result.server;

    const signin = await auth.api.signInEmail({
      body: { email: 'athronos21@gmail.com', password: 'Password123!' },
    });
    ownerToken = signin.token;
  });


  afterAll(() => {
    serverInstance?.close();
  });

  it('anonymous requests receive public store information without banking or national ID data', async () => {
    const res = await fetch(`${baseUrl}/api/pharmacy/profile`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    // Public fields present
    expect(body.data.storeName).toBeDefined();
    expect(body.data.operatingHours).toBeDefined();

    // Sensitive financial and personal fields stripped
    expect(body.data.bankAccountNumber).toBeUndefined();
    expect(body.data.cbeAccountNumber).toBeUndefined();
    expect(body.data.telebirrMerchantId).toBeUndefined();
    expect(body.data.tinNumber).toBeUndefined();
    expect(body.data.ownerNationalId).toBeUndefined();
    expect(body.data.ownerPharmacistLicense).toBeUndefined();
  });

  it('authenticated STORE_OWNER receives complete profile including banking details', async () => {
    // Populate banking details
    db.updatePharmacyProfile({
      cbeAccountNumber: '1000123456789',
      bankAccountNumber: '987654321',
    });

    const res = await fetch(`${baseUrl}/api/pharmacy/profile`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    // Full profile present
    expect(body.data.storeName).toBeDefined();
    expect(body.data.tinNumber).toBeDefined();
    expect(body.data.cbeAccountNumber).toBe('1000123456789');
    expect(body.data.bankAccountNumber).toBe('987654321');
    expect(body.data.ownerNationalId).toBe('ETH-ID-8829104');
  });

});
