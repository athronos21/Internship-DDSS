import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { startServer } from '../server';
import { db } from '../src/server/db';
import type { Server } from 'http';

describe('Owner Registration Security (/api/auth/register-owner)', () => {
  const TEST_PORT = 5692;
  const baseUrl = `http://localhost:${TEST_PORT}`;
  let serverInstance: Server;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const result = await startServer(TEST_PORT);
    serverInstance = result.server;

    // Seed existing admin account
    db.users.push({
      id: 'u-existing-superadmin',
      name: 'Existing Superadmin',
      email: 'target-admin@kaziniya.com',
      role: 'SUPER_ADMIN',
      isActive: true,
      password: 'OriginalAdminPassword123!',
      createdAt: new Date().toISOString(),
    });
  });

  afterAll(() => {
    serverInstance?.close();
  });

  it('rejects registration with 409 Conflict when email already exists', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register-owner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ownerName: 'Attacker Impersonator',
        ownerEmail: 'target-admin@kaziniya.com',
        password: 'AttackerNewPassword123!',
        storeName: 'Hijacked Pharmacy',
        tinNumber: 'TIN-HIJACK-001',
        streetAddress: '123 Fake Street',
      }),
    });
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.success).toBe(false);

    // Verify existing admin account was untouched
    const target = db.users.find((u) => u.email === 'target-admin@kaziniya.com');
    expect(target?.role).toBe('SUPER_ADMIN');
    expect(target?.password).toBe('OriginalAdminPassword123!');
  });

  it('rejects registration with 400 Bad Request when password is under 8 characters', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register-owner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ownerName: 'New Pharmacy Owner',
        ownerEmail: 'valid-owner-short@kaziniya.com',
        password: 'short',
        storeName: 'Valid Pharmacy',
        tinNumber: 'TIN-VAL-001',
        streetAddress: 'Bole Road',
      }),
    });
    expect(res.status).toBe(400);
  });

  it('creates new owner with hashed password and strips secrets from response', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register-owner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ownerName: 'New Legitimate Owner',
        ownerEmail: 'new-legit-owner@kaziniya.com',
        password: 'LegitimateOwnerPass2026!',
        storeName: 'Legitimate Central Pharmacy',
        tinNumber: 'TIN-LEGIT-999',
        streetAddress: 'Central Avenue',
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);

    // Secrets stripped from response
    expect(body.data.user.password).toBeUndefined();
    expect(body.data.user.pin).toBeUndefined();
    expect(body.data.owner.password).toBeUndefined();

    // Stored password is hashed
    const stored = db.users.find((u) => u.email === 'new-legit-owner@kaziniya.com');
    expect(stored).toBeDefined();
    expect(stored?.password).toContain(':');
    expect(stored?.password).not.toBe('LegitimateOwnerPass2026!');
  });
});
