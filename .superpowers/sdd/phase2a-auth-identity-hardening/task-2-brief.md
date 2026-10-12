# Task 2 Brief: Owner Registration Account Takeover Prevention (`POST /api/auth/register-owner`)

**Plan:** `docs/superpowers/plans/2026-10-12-phase2a-auth-identity-hardening.md`  
**Task Number:** 2  
**Spec:** `docs/superpowers/specs/2026-10-12-phase2a-auth-identity-hardening-design.md`

---

## Global Constraints
- Never overwrite or role-escalate an existing user via unauthenticated `/api/auth/register-owner`; return `409 Conflict`.
- Never store plaintext passwords; hash with `hashPassword(password)` (`scrypt` + salt).
- Never return `password`, `pin`, or `temporaryPassword` in JSON response bodies.
- Maintain clean compilation with `bun run lint` (`tsc --noEmit`) and passing tests with `bun test`.

---

## Task Details

**Files:**
- Modify: `src/server/routes/auth.routes.ts:335-570`
- Test: `tests/ownerRegistrationSecurity.test.ts`

**Interfaces:**
- Consumes: `hashPassword` from `../auth.js`, `auth.api.signUpEmail` from `../auth.js`
- Produces: Protected `/api/auth/register-owner` endpoint with zero-overwrite policy and hashed credentials

---

## Steps to Execute (TDD)

### Step 1: Write failing tests in `tests/ownerRegistrationSecurity.test.ts`
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

### Step 2: Run test to verify it fails
Run: `bun test tests/ownerRegistrationSecurity.test.ts`
Expected: FAIL

### Step 3: Implement protection in `src/server/routes/auth.routes.ts`
- If email exists in `db.users` or `authDb`:
  ```typescript
  const existingUserIndex = db.users.findIndex((u) => u.email.toLowerCase() === ownerEmail.toLowerCase().trim());
  if (existingUserIndex !== -1) {
    return res.status(409).json({
      success: false,
      message: 'An account with this email address already exists. Please sign in or use another email.',
    });
  }
  ```
- Reject password < 8 characters:
  ```typescript
  if (!password || password.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
  }
  ```
- Hash password using `hashPassword(password)`.
- Register in Better Auth (`await auth.api.signUpEmail(...)`).
- Sanitize response: delete `password`, `pin`, and `temporaryPassword` from both `user` and `owner`.

### Step 4: Run test to verify it passes
Run: `bun test tests/ownerRegistrationSecurity.test.ts`
Expected: PASS

### Step 5: Check TypeScript & tests
Run: `bun run lint`
Run: `bun test tests/ownerRegistrationSecurity.test.ts`

### Step 6: Commit
`git add src/server/routes/auth.routes.ts tests/ownerRegistrationSecurity.test.ts`
`git commit -m "feat(security): prevent account takeover on owner registration with 409 conflict check and hashed credentials"`
