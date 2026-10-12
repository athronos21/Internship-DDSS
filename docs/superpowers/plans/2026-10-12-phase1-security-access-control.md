# Phase 1: Security & Access Control Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate unauthenticated access, unverified header trust, and credential vulnerabilities across the Kaziniya DDSS backend API by enforcing verified session authentication and strict role-based access control.

**Architecture:** Replace legacy `x-user-id` header trust in `roleGuard.ts` with verified Better Auth session resolution (cookies and Bearer tokens), attach verified user records to request contexts, apply explicit `requireAuth` and `requireRole` middlewares across all domain routes, and secure credential handling.

**Tech Stack:** Express.js, Better Auth, Bun runtime, TypeScript, Zod.

**Spec:** [`docs/superpowers/specs/2026-10-12-phase1-security-access-control-design.md`](file:///C:/Users/Nythor/Desktop/ISP2026/Internship-DDSS/docs/superpowers/specs/2026-10-12-phase1-security-access-control-design.md)

## Global Constraints

- Never trust client-supplied `x-user-id` headers for identity or authorization.
- Never fallback to `users[0]` or any default user when unauthenticated; return `401 Unauthorized`.
- Protect all private endpoints under `/api` with verified session tokens.
- All password changes must require an active session and verification of `currentPassword`.
- Maintain clean compilation with `bun run lint` (`tsc --noEmit`) and passing tests with `bun test`.

## Review Focus

1. Requests with fabricated `x-user-id: u-superadmin` must receive `401 Unauthorized`.
2. Requests with forged or expired `Authorization: Bearer invalid-token` must receive `401 Unauthorized`.
3. Valid `PHARMACIST` sessions attempting management endpoints (`/api/reports/profit`) must receive `403 Forbidden`.
4. Password change requests without `currentPassword` or with incorrect `currentPassword` must be rejected with `400` or `401`.
5. Public endpoints (`/health`, `/api/catalog`) must remain accessible without authentication.

---

### Task 1: Security Middleware Hardening (`src/server/roleGuard.ts`)

**Files:**
- Modify: `src/server/roleGuard.ts`
- Test: `tests/securityMiddleware.test.ts`

**Interfaces:**
- Produces: `getAuthenticatedUser(req: Request): Promise<User | null>`
- Produces: `requireAuth: RequestHandler`
- Produces: `requireRole(allowedRoles: UserRole[]): RequestHandler`

- [x] **Step 1: Write failing tests for session resolution and forgery rejection in `tests/securityMiddleware.test.ts`**

```typescript
import { describe, it, expect } from 'bun:test';
import { getAuthenticatedUser, requireAuth, requireRole } from '../src/server/roleGuard';

describe('Security Middleware Hardening', () => {
  it('rejects unauthenticated requests without session credentials', async () => {
    const req = { headers: {} } as any;
    const user = await getAuthenticatedUser(req);
    expect(user).toBeNull();
  });

  it('rejects forged x-user-id header without valid session token', async () => {
    const req = { headers: { 'x-user-id': 'u-superadmin' } } as any;
    const user = await getAuthenticatedUser(req);
    expect(user).toBeNull();
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `bun test tests/securityMiddleware.test.ts`
Expected: FAIL because `getAuthenticatedUser` currently falls back to `db.users[0]`.

- [x] **Step 3: Update `getAuthenticatedUser`, `requireAuth`, and `requireRole` in `src/server/roleGuard.ts`**

Implement session extraction from `cookie` / `Authorization: Bearer <token>`, validate with Better Auth `auth.api.getSession`, and return `null` if unverified. Remove all fallback code.

- [x] **Step 4: Run test to verify it passes**

Run: `bun test tests/securityMiddleware.test.ts`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add src/server/roleGuard.ts tests/securityMiddleware.test.ts
git commit -m "feat(security): harden roleGuard to validate sessions and reject forged headers"
```

---

### Task 2: Apply Role Protection Matrix to Domain Routers

**Files:**
- Modify: `src/server/routes/inventory.routes.ts`
- Modify: `src/server/routes/pos.routes.ts`
- Modify: `src/server/routes/purchasing.routes.ts`
- Modify: `src/server/routes/finance.routes.ts`
- Test: `tests/routeAuthorization.test.ts`

**Interfaces:**
- Consumes: `requireAuth`, `requireRole` from `../roleGuard.js`
- Enforces: `PHARMACIST`+ on counter endpoints, `STORE_OWNER`+ on procurement/finance, `SUPER_ADMIN` on governance

- [x] **Step 1: Write failing tests for route guards in `tests/routeAuthorization.test.ts`**

```typescript
import { describe, it, expect } from 'bun:test';
import { createExpressApp } from '../server';

describe('Route Authorization Matrix', () => {
  it('blocks anonymous access to POST /api/sales with 401', async () => {
    const app = await createExpressApp();
    const res = await app.request('/api/sales', { method: 'POST', body: JSON.stringify({}) });
    expect(res.status).toBe(401);
  });

  it('blocks anonymous access to GET /api/reports/profit with 401', async () => {
    const app = await createExpressApp();
    const res = await app.request('/api/reports/profit', { method: 'GET' });
    expect(res.status).toBe(401);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `bun test tests/routeAuthorization.test.ts`
Expected: FAIL because routes are currently unguarded or using fallback users.

- [x] **Step 3: Apply `requireAuth` and `requireRole` middleware across domain router endpoints**

Mount `requireAuth` on private router groups, and attach `requireRole(['STORE_OWNER', 'SUPER_ADMIN'])` to management/finance/procurement routes. Keep public catalog routes unauthenticated.

- [x] **Step 4: Run test to verify it passes**

Run: `bun test tests/routeAuthorization.test.ts`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add src/server/routes/ tests/routeAuthorization.test.ts
git commit -m "feat(security): apply requireAuth and requireRole guards across domain routes"
```

---

### Task 3: Secure Password Changes and Credential Validation

**Files:**
- Modify: `src/server/routes/auth.routes.ts`
- Modify: `src/server/auth.ts`
- Test: `tests/passwordSecurity.test.ts`

**Interfaces:**
- Consumes: `requireAuth` from `../roleGuard.js`
- Enforces: Current password verification, complexity rules, and cryptographic hashing on `/api/auth/change-password`

- [x] **Step 1: Write failing tests for password change security in `tests/passwordSecurity.test.ts`**

```typescript
import { describe, it, expect } from 'bun:test';
import { createExpressApp } from '../server';

describe('Password Security', () => {
  it('rejects password change without session authentication', async () => {
    const app = await createExpressApp();
    const res = await app.request('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword: 'NewPassword123!' }),
    });
    expect(res.status).toBe(401);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `bun test tests/passwordSecurity.test.ts`
Expected: FAIL

- [x] **Step 3: Implement current password verification and secure update logic in `src/server/routes/auth.routes.ts`**

Require `currentPassword` in the request body, compare with the authenticated user's stored hash, validate `newPassword` length and complexity, update hash, and return clean response.

- [x] **Step 4: Run test to verify it passes**

Run: `bun test tests/passwordSecurity.test.ts`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add src/server/routes/auth.routes.ts src/server/auth.ts tests/passwordSecurity.test.ts
git commit -m "feat(security): require session and current password verification for credential updates"
```

---

### Task 4: Full Security Regression Verification

**Files:**
- Test: `tests/securityHardening.test.ts`

- [x] **Step 1: Write comprehensive security integration test suite in `tests/securityHardening.test.ts`**

Cover anonymous rejection, identity spoofing rejection, role privilege isolation (pharmacist vs owner vs admin), and public endpoint accessibility.

- [x] **Step 2: Execute full test suite and TypeScript validation**

Run: `bun test`
Expected: All tests pass.
Run: `bun run lint`
Expected: 0 errors.

- [x] **Step 3: Verify production build**

Run: `bun run build`
Expected: Production bundle builds cleanly with exit code 0.

- [x] **Step 4: Commit**

```bash
git add tests/securityHardening.test.ts
git commit -m "test(security): add comprehensive security regression suite"
```
