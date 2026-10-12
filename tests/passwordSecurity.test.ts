import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import { Server } from 'http';
import { startServer } from '../server';
import { auth, seedInitialBetterAuthUsers } from '../src/server/auth';
import { db } from '../src/server/db';

describe('Password Security & Credential Hardening', () => {
  let serverInstance: Server;
  const TEST_PORT = 5688;
  const baseUrl = `http://localhost:${TEST_PORT}`;
  let validSessionToken: string = '';
  const testUserEmail = 'pwd-test-user@kaziniya.com';

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await seedInitialBetterAuthUsers();
    const result = await startServer(TEST_PORT);
    serverInstance = result.server;

    // Create a dedicated isolated test account
    try {
      await auth.api.signUpEmail({
        body: {
          email: testUserEmail,
          password: 'InitialPassword123!',
          name: 'Dedicated Test Staff',
        },
      });
    } catch {}

    db.users.push({
      id: 'u-pwd-isolated-test',
      name: 'Dedicated Test Staff',
      email: testUserEmail,
      role: 'PHARMACIST',
      isActive: true,
      password: 'InitialPassword123!',
      createdAt: new Date().toISOString(),
    });

    // Sign in using Better Auth to obtain a verified session token
    const signin = await auth.api.signInEmail({
      body: {
        email: testUserEmail,
        password: 'InitialPassword123!',
      },
    });
    validSessionToken = signin.token;
  });

  afterAll((done) => {
    if (serverInstance) {
      serverInstance.close(() => done());
    } else {
      done();
    }
  });

  it('rejects password change without session authentication with 401', async () => {
    const res = await fetch(`${baseUrl}/api/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        newPassword: 'NewSecurePassword123!',
      }),
    });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('rejects password change when currentPassword is missing with 400', async () => {
    const res = await fetch(`${baseUrl}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validSessionToken}`,
      },
      body: JSON.stringify({
        newPassword: 'NewSecurePassword123!',
      }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('Current password is required');
  });

  it('rejects password change when currentPassword is incorrect with 400 or 401', async () => {
    const res = await fetch(`${baseUrl}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validSessionToken}`,
      },
      body: JSON.stringify({
        currentPassword: 'WrongOldPassword!',
        newPassword: 'NewSecurePassword123!',
      }),
    });
    expect([400, 401]).toContain(res.status);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('rejects new password that does not meet length requirement with 400', async () => {
    const res = await fetch(`${baseUrl}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validSessionToken}`,
      },
      body: JSON.stringify({
        currentPassword: 'InitialPassword123!',
        newPassword: 'short',
      }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('successfully updates and hashes password when authenticated with valid credentials', async () => {
    const res = await fetch(`${baseUrl}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validSessionToken}`,
      },
      body: JSON.stringify({
        currentPassword: 'InitialPassword123!',
        newPassword: 'BrandNewSecure#2026',
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    // Verify stored password is now hashed (contains salt separator :)
    const updatedUser = db.users.find((u) => u.email === testUserEmail)!;
    expect(updatedUser.password).toBeDefined();
    expect(updatedUser.password).toContain(':');
    expect(updatedUser.password).not.toBe('BrandNewSecure#2026');
  });
});
