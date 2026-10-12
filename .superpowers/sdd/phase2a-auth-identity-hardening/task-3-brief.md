# Task 3 Brief: Pharmacy Profile Privacy & Role-Based Sanitization (`GET /api/pharmacy/profile`)

**Plan:** `docs/superpowers/plans/2026-10-12-phase2a-auth-identity-hardening.md`  
**Task Number:** 3  
**Spec:** `docs/superpowers/specs/2026-10-12-phase2a-auth-identity-hardening-design.md`

---

## Global Constraints
- Never expose bank accounts, TIN, or owner national ID on `/api/pharmacy/profile` to unauthenticated or non-management callers.
- Maintain clean compilation with `bun run lint` (`tsc --noEmit`) and passing tests with `bun test`.

---

## Task Details

**Files:**
- Modify: `src/server/routes/auth.routes.ts:42-50`
- Test: `tests/pharmacyProfileSecurity.test.ts`

**Interfaces:**
- Consumes: `getAuthenticatedUser` from `../roleGuard.js`
- Produces: Sanitized `GET /api/pharmacy/profile` endpoint protecting banking and licensing data from public callers

---

## Steps to Execute (TDD)

### Step 1: Write failing tests in `tests/pharmacyProfileSecurity.test.ts`
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

### Step 2: Run test to verify it fails
Run: `bun test tests/pharmacyProfileSecurity.test.ts`
Expected: FAIL

### Step 3: Implement profile privacy in `src/server/routes/auth.routes.ts`
```typescript
authRouter.get('/pharmacy/profile', async (req, res) => {
  try {
    const profile = db.getPharmacyProfile();
    const caller = await getAuthenticatedUser(req);
    const isPrivileged = caller && (caller.role === 'STORE_OWNER' || caller.role === 'SUPER_ADMIN');

    if (isPrivileged) {
      return res.json({ success: true, data: profile });
    }

    // Return sanitized public profile
    const publicFields = [
      'id', 'storeName', 'storeNameAmharic', 'storeType', 'logoUrl', 'storeSlogan',
      'phone', 'email', 'operatingHours', 'is24Hours', 'coldChainAvailable',
      'deliveryAvailable', 'city', 'subcity', 'woreda', 'kebele', 'houseNumber',
      'streetAddress', 'landmark', 'gpsCoordinates', 'receiptHeaderMessage', 'receiptFooterMessage'
    ];
    const sanitized: any = {};
    for (const k of publicFields) {
      if ((profile as any)[k] !== undefined) {
        sanitized[k] = (profile as any)[k];
      }
    }
    res.json({ success: true, data: sanitized });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
```

### Step 4: Run test to verify it passes
Run: `bun test tests/pharmacyProfileSecurity.test.ts`
Expected: PASS

### Step 5: Check TypeScript & tests
Run: `bun run lint`
Run: `bun test tests/pharmacyProfileSecurity.test.ts`

### Step 6: Commit
`git add src/server/routes/auth.routes.ts tests/pharmacyProfileSecurity.test.ts`
`git commit -m "feat(security): protect private pharmacy profile banking and licensing fields from unauthorized callers"`
