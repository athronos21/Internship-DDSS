import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { Server } from 'http';
import { startServer } from '../server.js';
import { auth, authDb, seedInitialBetterAuthUsers } from '../src/server/auth.js';

describe('Better Auth Security & Session Suite (Superpowers TDD)', () => {
  let serverInstance: Server;
  const TEST_PORT = 5199;
  const baseUrl = `http://localhost:${TEST_PORT}`;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await seedInitialBetterAuthUsers();
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

  it('1. Pre-seeds default institutional users with custom roles', () => {
    const user = authDb.query('SELECT * FROM user WHERE email = ?').get('athronos21@gmail.com') as any;
    expect(user).toBeDefined();
    expect(user.email).toBe('athronos21@gmail.com');
    expect(user.role).toBe('SUPER_ADMIN');

    const pharmacist = authDb.query('SELECT * FROM user WHERE email = ?').get('munaa7536@gmail.com') as any;
    expect(pharmacist).toBeDefined();
    expect(pharmacist.role).toBe('PHARMACIST');
  });

  it('2. Successfully signs in with correct email and password and creates a session', async () => {
    const result = await auth.api.signInEmail({
      body: {
        email: 'athronos21@gmail.com',
        password: 'Password123!',
      },
    });

    expect(result).toBeDefined();
    expect(result.token).toBeDefined();
    expect(result.user.email).toBe('athronos21@gmail.com');

    // Verify session stored in auth database
    const sessionRecord = authDb.query('SELECT * FROM session WHERE token = ?').get(result.token) as any;
    expect(sessionRecord).toBeDefined();
    expect(sessionRecord.userId).toBe(result.user.id);
  });

  it('3. Rejects sign in with invalid password', async () => {
    try {
      await auth.api.signInEmail({
        body: {
          email: 'athronos21@gmail.com',
          password: 'WrongPassword!',
        },
      });
      expect(true).toBe(false); // Should not reach here
    } catch (err: any) {
      expect(err).toBeDefined();
    }
  });

  it('4. Allows creating a new staff account and retrieves session', async () => {
    const testEmail = `pharmacist-${Date.now()}@kaziniya.et`;
    const signupResult = await auth.api.signUpEmail({
      body: {
        email: testEmail,
        password: 'SecurePassword123!',
        name: 'Tigist Bekele, RPh',
      },
    });

    expect(signupResult).toBeDefined();
    expect(signupResult.user.email).toBe(testEmail);
    expect(signupResult.token).toBeDefined();

    // Verify user exists in SQLite
    const userInDb = authDb.query('SELECT * FROM user WHERE email = ?').get(testEmail) as any;
    expect(userInDb).toBeDefined();
    expect(userInDb.name).toBe('Tigist Bekele, RPh');
  });

  it('5. Handles HTTP POST /api/auth/sign-in/email via mounted Express handler', async () => {
    const res = await fetch(`${baseUrl}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@kaziniya.et',
        password: 'Password123!',
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe('admin@kaziniya.et');
    expect(body.token).toBeDefined();
  });
});
