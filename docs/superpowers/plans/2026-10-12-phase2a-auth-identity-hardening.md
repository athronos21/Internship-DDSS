# Phase 2A: Authentication & Identity Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate authentication bypasses, unauthenticated account takeover vectors, and information disclosure across `/api/auth/login`, `/api/auth/register-owner`, `/api/pharmacy/profile`, `api/index.ts`, and the mobile API client.

**Architecture:** Enforce strict password validation and real Better Auth session issuance in `/api/auth/login`; implement zero-overwrite `409 Conflict` checks in `/api/auth/register-owner`; filter banking/national ID data in `/api/pharmacy/profile` based on caller role; sanitize serverless gateway error payloads; and remove default identity headers from Flutter client.

**Tech Stack:** Express.js, Better Auth, Bun runtime, TypeScript, scrypt (`node:crypto`).

**Spec:** [`docs/superpowers/specs/2026-10-12-phase2a-auth-identity-hardening-design.md`](file:///C:/Users/Nythor/Desktop/ISP2026/Internship-DDSS/docs/superpowers/specs/2026-10-12-phase2a-auth-identity-hardening-design.md)

## Global Constraints

- Never accept an empty password on `/api/auth/login`; return `400 Bad Request`.
- Never fall back to shared demo passwords; credentials must match stored hashes.
- Never overwrite or role-escalate an existing user via unauthenticated `/api/auth/register-owner`; return `409 Conflict`.
- Never return `password`, `pin`, or `temporaryPassword` in JSON response bodies.
- Never expose bank accounts, TIN, or owner national ID on `/api/pharmacy/profile` to unauthenticated or non-management callers.
- Never serialize error stack traces into client responses in `api/index.ts`.
- Maintain clean compilation with `bun run lint` (`tsc --noEmit`) and passing tests with `bun test`.

## Review Focus

1. Anonymous `POST /api/auth/login` with missing `password` receives `400 Bad Request`.
2. Existing account email submitted to `POST /api/auth/register-owner` receives `409 Conflict` without modifying stored records.
3. Successful login returns a verified Better Auth bearer token accepted by `getAuthenticatedUser(req)`.
4. Anonymous `GET /api/pharmacy/profile` contains no banking account numbers or owner national IDs.
5. Serverless 500 error in `api/index.ts` returns opaque message with no `stack` property.

---

### Task 1: Legacy Login Hardening (`POST /api/auth/login`)

**Files:**
- Modify: `src/server/routes/auth.routes.ts:133-207`
- Test: `tests/legacyLoginHardening.test.ts`

**Interfaces:**
- Consumes: `auth.api.signInEmail` from `../auth.js`, `verifyPassword` from `../auth.js`, `getAuthenticatedUser` from `../roleGuard.js`
- Produces: Hardened `/api/auth/login` route issuing verified Better Auth sessions and returning sanitized user objects

- [ ] **Step 1: Write failing tests for login credential validation and session issuance in `tests/legacyLoginHardening.test.ts`**

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

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test tests/legacyLoginHardening.test.ts`
Expected: FAIL because missing password currently returns 200, demo passwords pass, and returned user contains credentials.

- [ ] **Step 3: Refactor `POST /api/auth/login` in `src/server/routes/auth.routes.ts`**

Implement:
- Reject empty password: `if (!password || !password.trim()) return res.status(400).json({ success: false, message: 'Password is required' });`
- Resolve user by email or employeeId.
- Verify password against Better Auth `auth.api.signInEmail` or `verifyPassword(password, user.password)`. If authenticated via `verifyPassword`, issue a Better Auth session.
- Strip `password`, `pin`, and `temporaryPassword` from user before returning.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test tests/legacyLoginHardening.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/routes/auth.routes.ts tests/legacyLoginHardening.test.ts
git commit -m "feat(security): harden legacy login to require passwords, issue verified sessions, and strip secrets"
```

---

### Task 2: Owner Registration Account Takeover Prevention (`POST /api/auth/register-owner`)

**Files:**
- Modify: `src/server/routes/auth.routes.ts:335-570`
- Test: `tests/ownerRegistrationSecurity.test.ts`

**Interfaces:**
- Consumes: `hashPassword` from `../auth.js`, `auth.api.signUpEmail` from `../auth.js`
- Produces: Protected `/api/auth/register-owner` endpoint with zero-overwrite policy and hashed credentials

- [ ] **Step 1: Write failing tests for registration security in `tests/ownerRegistrationSecurity.test.ts`**

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { startServer } from '../src/server/index';
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test tests/ownerRegistrationSecurity.test.ts`
Expected: FAIL because existing email currently updates and overwrites the account.

- [ ] **Step 3: Update `POST /api/auth/register-owner` in `src/server/routes/auth.routes.ts`**

Implement:
- Conflict check: if `db.users.some(u => u.email.toLowerCase() === ownerEmail.toLowerCase().trim())`, return `res.status(409).json({ success: false, message: 'An account with this email address already exists. Please sign in or use another email.' })`.
- Minimum 8-character password validation.
- Hash password with `hashPassword(password)`.
- Register in Better Auth (`auth.api.signUpEmail`).
- Strip credentials from response.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test tests/ownerRegistrationSecurity.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/routes/auth.routes.ts tests/ownerRegistrationSecurity.test.ts
git commit -m "feat(security): prevent account takeover on owner registration with 409 conflict check and hashed credentials"
```

---

### Task 3: Pharmacy Profile Privacy & Role-Based Sanitization (`GET /api/pharmacy/profile`)

**Files:**
- Modify: `src/server/routes/auth.routes.ts:42-50`
- Test: `tests/pharmacyProfileSecurity.test.ts`

**Interfaces:**
- Consumes: `getAuthenticatedUser` from `../roleGuard.js`
- Produces: Sanitized `GET /api/pharmacy/profile` endpoint protecting banking and licensing data from public callers

- [ ] **Step 1: Write failing tests for profile data sanitization in `tests/pharmacyProfileSecurity.test.ts`**

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { startServer } from '../src/server/index';
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
      body: { email: 'admin@kaziniya.com', password: 'Password123!' },
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
    const res = await fetch(`${baseUrl}/api/pharmacy/profile`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    // Full profile present
    expect(body.data.storeName).toBeDefined();
    expect(body.data.tinNumber).toBeDefined();
    expect(body.data.cbeAccountNumber).toBeDefined();
    expect(body.data.bankAccountNumber).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test tests/pharmacyProfileSecurity.test.ts`
Expected: FAIL because anonymous requests currently receive bank account numbers and TINs.

- [ ] **Step 3: Update `GET /api/pharmacy/profile` in `src/server/routes/auth.routes.ts`**

Implement:
- Resolve caller: `const caller = await getAuthenticatedUser(req);`
- Check `isPrivileged = caller && (caller.role === 'STORE_OWNER' || caller.role === 'SUPER_ADMIN');`
- If `!isPrivileged`, filter profile:
  ```typescript
  const publicFields = [
    'id', 'storeName', 'storeNameAmharic', 'storeType', 'logoUrl', 'storeSlogan',
    'phone', 'email', 'operatingHours', 'is24Hours', 'coldChainAvailable',
    'deliveryAvailable', 'city', 'subcity', 'woreda', 'kebele', 'houseNumber',
    'streetAddress', 'landmark', 'gpsCoordinates', 'receiptHeaderMessage', 'receiptFooterMessage'
  ];
  const sanitized: any = {};
  for (const k of publicFields) {
    sanitized[k] = (profile as any)[k];
  }
  return res.json({ success: true, data: sanitized });
  ```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test tests/pharmacyProfileSecurity.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/routes/auth.routes.ts tests/pharmacyProfileSecurity.test.ts
git commit -m "feat(security): protect private pharmacy profile banking and licensing fields from unauthorized callers"
```

---

### Task 4: Serverless Gateway Error Sanitization & Mobile Client Cleanup

**Files:**
- Modify: `api/index.ts:33-45`
- Modify: `mobile/lib/services/api_service.dart:18-20, 36-40`
- Test: `tests/gatewaySanitization.test.ts`

**Interfaces:**
- Produces: Sanitized Vercel serverless error output and clean Flutter API client options

- [ ] **Step 1: Write test for serverless error sanitization in `tests/gatewaySanitization.test.ts`**

```typescript
import { describe, it, expect } from 'bun:test';
import fs from 'fs';
import path from 'path';

describe('Serverless & Mobile Client Sanitization', () => {
  it('api/index.ts catch block does not return stack trace in client payload', () => {
    const content = fs.readFileSync(path.resolve(process.cwd(), 'api/index.ts'), 'utf-8');
    expect(content).not.toContain('stack: err?.stack');
    expect(content).not.toContain('err?.stack');
    expect(content).toContain("message: 'Internal server error'");
  });

  it('mobile/lib/services/api_service.dart does not contain default x-user-id header', () => {
    const content = fs.readFileSync(
      path.resolve(process.cwd(), 'mobile/lib/services/api_service.dart'),
      'utf-8'
    );
    expect(content).not.toContain("'x-user-id': 'u-2'");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test tests/gatewaySanitization.test.ts`
Expected: FAIL because `api/index.ts` contains `stack: err?.stack` and `api_service.dart` contains `'x-user-id': 'u-2'`.

- [ ] **Step 3: Sanitize `api/index.ts` and `mobile/lib/services/api_service.dart`**

In `api/index.ts`:
```typescript
catch (err: any) {
  console.error('[Vercel Serverless Gateway Error]', err);
  res.statusCode = 500;
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      success: false,
      message: 'Internal server error',
    })
  );
}
```

In `mobile/lib/services/api_service.dart`:
Remove `'x-user-id': 'u-2'` from default headers and from `clearAuthHeaders()`.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test tests/gatewaySanitization.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add api/index.ts mobile/lib/services/api_service.dart tests/gatewaySanitization.test.ts
git commit -m "feat(security): sanitize serverless error responses and remove mobile default user identity headers"
```

---

### Task 5: Full Regression Verification & CI Sanity

**Files:**
- Test: All tests across `tests/`

- [ ] **Step 1: Execute full test suite**

Run: `bun test`
Expected: 100% pass across all test files.

- [ ] **Step 2: Execute TypeScript compilation check**

Run: `bun run lint`
Expected: 0 errors.

- [ ] **Step 3: Execute production build**

Run: `bun run build`
Expected: Client and server bundles build cleanly with exit code 0.

- [ ] **Step 4: Commit**

```bash
git commit --allow-empty -m "chore(security): verify full Phase 2A security hardening test suite and production build"
```
