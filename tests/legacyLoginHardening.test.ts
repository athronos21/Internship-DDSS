import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { startServer } from '../server';
import { db } from '../src/server/db';
import { auth, hashPassword } from '../src/server/auth';
import type { Server } from 'http';

describe('Legacy Login Hardening (/api/auth/login)', () => {
  const TEST_PORT = 5691;
  const baseUrl = `http://localhost:${TEST_PORT}`;
  let serverInstance: Server;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const result = await startServer(TEST_PORT);
    serverInstance = result.server;

    // Seed test user with hashed password
    const testEmail = 'login-test-staff@kaziniya.com';
    const testPassword = 'StrongPassword2026!';
    try {
      await auth.api.signUpEmail({
        body: { email: testEmail, password: testPassword, name: 'Login Test Staff' },
      });
    } catch {}

    db.users.push({
      id: 'u-login-test-staff',
      name: 'Login Test Staff',
      email: testEmail,
      employeeId: 'KZN-TEST-001',
      role: 'PHARMACIST',
      isActive: true,
      password: hashPassword(testPassword),
      createdAt: new Date().toISOString(),
    });
  });

  afterAll(() => {
    serverInstance?.close();
  });

  it('rejects login when password is missing with 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'login-test-staff@kaziniya.com' }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('rejects login with incorrect password with 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'login-test-staff@kaziniya.com',
        password: 'WrongPassword!',
      }),
    });
    expect(res.status).toBe(401);
  });

  it('rejects login with shared demo password on non-demo credentials with 401', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'login-test-staff@kaziniya.com',
        password: 'Password123!',
      }),
    });
    expect(res.status).toBe(401);
  });

  it('successfully authenticates with valid password and returns verified session token without leaking secrets', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'login-test-staff@kaziniya.com',
        password: 'StrongPassword2026!',
      }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.token).toBeDefined();

    // Verify secrets are stripped
    expect(body.user.password).toBeUndefined();
    expect(body.user.pin).toBeUndefined();
    expect(body.user.temporaryPassword).toBeUndefined();

    // Verify token works on protected endpoints
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${body.token}` },
    });
    expect(meRes.status).toBe(200);
    const meBody = await meRes.json();
    expect(meBody.data.email).toBe('login-test-staff@kaziniya.com');
  });

  it('authenticates via employeeId with valid password', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'KZN-TEST-001',
        password: 'StrongPassword2026!',
      }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.email).toBe('login-test-staff@kaziniya.com');
  });
});
