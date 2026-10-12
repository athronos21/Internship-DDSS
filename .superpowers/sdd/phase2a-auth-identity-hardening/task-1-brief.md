# Task 1 Brief: Legacy Login Hardening (`POST /api/auth/login`)

**Plan:** `docs/superpowers/plans/2026-10-12-phase2a-auth-identity-hardening.md`  
**Task Number:** 1  
**Spec:** `docs/superpowers/specs/2026-10-12-phase2a-auth-identity-hardening-design.md`

---

## Global Constraints
- Never accept an empty password on `/api/auth/login`; return `400 Bad Request`.
- Never fall back to shared demo passwords; credentials must match stored hashes or Better Auth.
- Never return `password`, `pin`, or `temporaryPassword` in JSON response bodies.
- Maintain clean compilation with `bun run lint` (`tsc --noEmit`) and passing tests with `bun test`.

---

## Task Details

**Files:**
- Modify: `src/server/routes/auth.routes.ts:133-207`
- Test: `tests/legacyLoginHardening.test.ts`

**Interfaces:**
- Consumes: `auth.api.signInEmail` from `../auth.js`, `verifyPassword` from `../auth.js`, `getAuthenticatedUser` from `../roleGuard.js`
- Produces: Hardened `/api/auth/login` route issuing verified Better Auth sessions and returning sanitized user objects

---

## Steps to Execute (TDD)

### Step 1: Write failing tests in `tests/legacyLoginHardening.test.ts`
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { startServer } from '../src/server/index';
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
```

### Step 2: Run test to verify it fails
Run: `bun test tests/legacyLoginHardening.test.ts`
Expected: FAIL

### Step 3: Implement hardening in `src/server/routes/auth.routes.ts`
- Reject missing or whitespace-only password with `400 Bad Request`.
- Resolve user by email or employeeId from `db.users`.
- Remove `demoFallbackPasswords` array and bypass logic.
- Authenticate credentials against Better Auth (`auth.api.signInEmail({ body: { email: user.email, password }, headers: req.headers })`) or verify against stored hash with `verifyPassword`.
- When valid, create/obtain Better Auth session token so `getAuthenticatedUser(req)` succeeds on subsequent calls with `Authorization: Bearer <token>`.
- Strip `password`, `pin`, and `temporaryPassword` from user before sending response.

### Step 4: Run test to verify it passes
Run: `bun test tests/legacyLoginHardening.test.ts`
Expected: PASS

### Step 5: Check TypeScript & tests
Run: `bun run lint`
Run: `bun test tests/legacyLoginHardening.test.ts`

### Step 6: Commit
`git add src/server/routes/auth.routes.ts tests/legacyLoginHardening.test.ts`
`git commit -m "feat(security): harden legacy login to require passwords, issue verified sessions, and strip secrets"`
