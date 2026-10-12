# Task 1 Brief: Security Middleware Hardening (`src/server/roleGuard.ts`)

**Files:**
- Modify: `src/server/roleGuard.ts`
- Test: `tests/securityMiddleware.test.ts`

**Interfaces:**
- Produces: `getAuthenticatedUser(req: Request): Promise<User | null>`
- Produces: `requireAuth: RequestHandler`
- Produces: `requireRole(allowedRoles: UserRole[]): RequestHandler`

## Step 1: Write failing tests for session resolution and forgery rejection in `tests/securityMiddleware.test.ts`

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

  it('rejects invalid or forged bearer token', async () => {
    const req = { headers: { authorization: 'Bearer fake-token-123' } } as any;
    const user = await getAuthenticatedUser(req);
    expect(user).toBeNull();
  });
});
```

## Step 2: Run test to verify it fails
Run: `bun test tests/securityMiddleware.test.ts`
Expected: FAIL because `getAuthenticatedUser` currently falls back to `db.users[0]`.

## Step 3: Update `getAuthenticatedUser`, `requireAuth`, and `requireRole` in `src/server/roleGuard.ts`
Implement session extraction from cookie or `Authorization: Bearer <token>`, validate with Better Auth `auth.api.getSession`, and return `null` if unverified. Remove all fallback to `users[0]`.
Ensure `requireAuth` returns `401 Unauthorized` if `req.user` is missing.
Ensure `requireRole(allowedRoles)` returns `403 Forbidden` if `req.user.role` is not in `allowedRoles`.

## Step 4: Run test to verify it passes
Run: `bun test tests/securityMiddleware.test.ts`
Expected: PASS

## Step 5: Commit
Commit: `feat(security): harden roleGuard to validate sessions and reject forged headers`
