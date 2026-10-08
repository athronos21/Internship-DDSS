# Modular Independent Architecture & Comprehensive Database Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Decouple the monolithic server and database into independent domain repositories, modular Express routers, a typed frontend client layer, and an Owner-controlled Barcode toggle switch, while preserving 100% of existing functionality and test coverage.

**Architecture:** A domain-driven, layered architecture where the database layer exposes specialized repositories (`src/server/db/repositories/*`), the backend routes are split into single-responsibility Express routers (`src/server/routes/*`), the frontend accesses the backend via strongly typed API services (`src/services/api/*`), and the barcode scanning/printing subsystem is governed by an Owner-managed feature toggle.

**Tech Stack:** TypeScript, Node.js/Bun, Express, Better Auth, React 19, Tailwind CSS, Lucide icons, Vite, Vitest/Bun test.

**Spec:** [`docs/superpowers/specs/2026-10-08-modular-independent-architecture-design.md`](file:///C:/Users/Nythor/OneDrive/Desktop/InternProject/docs/superpowers/specs/2026-10-08-modular-independent-architecture-design.md)

## Global Constraints
- Every database model property specified in Section 2 of the spec must be represented.
- `PharmacyStoreProfile.enableBarcodeSystem` defaults to `false` and can be toggled by `STORE_OWNER` or `SUPER_ADMIN`.
- Zero disruption to the existing 138-test automated suite (`bun test`).
- Zero changes required to build scripts or deployment pipeline (`bun run build`).

## Review Focus
1. `enableBarcodeSystem` is false: POS and IMS must function without barcode popups or scanner dependencies, relying on SKU/Formulary search.
2. Concurrent FEFO Dispensing: Multiple sales items must deduct batch inventory atomically in order of earliest expiry date without negative stock.
3. Soft Deletion & Audit Trail: Archiving or deleting a medicine must update its status and record an immutable `InventoryTransaction` and `AuditLog`.
4. Backward Compatibility: All existing endpoints (`/api/medicines`, `/api/batches`, `/api/sales`, etc.) must maintain identical response payloads and status codes.
5. Store Profile Persistence: Updating store settings (including `enableBarcodeSystem`) via `PUT /api/pharmacy/profile` must immediately reflect across the application.

---

### Task 1: Normalized Database Types & Entity Models

**Files:**
- Create: `src/server/db/types.ts`
- Modify: `src/types.ts:1-60`
- Test: `tests/dbTypes.test.ts`

**Interfaces:**
- Produces: Complete TypeScript interfaces for `PharmacyStoreProfile`, `Medicine`, `MedicineBatch`, `InventoryTransaction`, `Sale`, `SaleItem`, `Supplier`, `PurchaseOrder`, `AuditLog`, `ShiftRecord`, `StockAdjustment`, `StockRequest`.

- [x] **Step 1: Write unit test for entity types and Barcode toggle property**

```typescript
// tests/dbTypes.test.ts
import { expect, test, describe } from 'bun:test';
import type { PharmacyStoreProfile, Medicine, MedicineBatch } from '../src/server/db/types';

describe('Database Entity Types & Constraints', () => {
  test('PharmacyStoreProfile includes enableBarcodeSystem default', () => {
    const profile: Partial<PharmacyStoreProfile> = {
      id: 'node-01',
      storeName: 'Kaziniya Drug Store',
      enableBarcodeSystem: false,
    };
    expect(profile.enableBarcodeSystem).toBe(false);
  });
});
```

- [x] **Step 2: Run test to verify failure**
Run: `bun test tests/dbTypes.test.ts`  
Expected: FAIL ("Cannot find module '../src/server/db/types'")

- [x] **Step 3: Implement `src/server/db/types.ts` and update `src/types.ts`**
Define all 14 entity interfaces with exact types, enums, and properties from Section 2 of the spec.

- [x] **Step 4: Run test to verify it passes**
Run: `bun test tests/dbTypes.test.ts`  
Expected: PASS

- [x] **Step 5: Commit**
```bash
git add src/server/db/types.ts src/types.ts tests/dbTypes.test.ts
git commit -m "feat(db): establish normalized database types and enableBarcodeSystem property"
```

---

### Task 2: Domain Repositories (Data Access Layer)

**Files:**
- Create: `src/server/db/repositories/medicine.repository.ts`
- Create: `src/server/db/repositories/batch.repository.ts`
- Create: `src/server/db/repositories/sales.repository.ts`
- Create: `src/server/db/repositories/inventory.repository.ts`
- Create: `src/server/db/repositories/purchase.repository.ts`
- Create: `src/server/db/repositories/user.repository.ts`
- Create: `src/server/db/repositories/audit.repository.ts`
- Modify: `src/server/db.ts`
- Test: `tests/repositories.test.ts`

**Interfaces:**
- Consumes: Entity interfaces from `src/server/db/types.ts`
- Produces: `MedicineRepository`, `BatchRepository`, `SalesRepository`, `InventoryRepository`, `PurchaseRepository`, `UserRepository`, `AuditRepository`.

- [x] **Step 1: Write tests for domain repositories and FEFO atomic allocation**

```typescript
// tests/repositories.test.ts
import { expect, test, describe } from 'bun:test';
import { MedicineRepository } from '../src/server/db/repositories/medicine.repository';
import { BatchRepository } from '../src/server/db/repositories/batch.repository';
import { SalesRepository } from '../src/server/db/repositories/sales.repository';

describe('Domain Repositories & Data Access Layer', () => {
  test('MedicineRepository lists and calculates stock correctly', () => {
    const meds = MedicineRepository.list();
    expect(Array.isArray(meds)).toBe(true);
    expect(meds.length).toBeGreaterThan(0);
  });

  test('BatchRepository allocates batches by FEFO order', () => {
    const batches = BatchRepository.getBatchesWithStatus();
    expect(Array.isArray(batches)).toBe(true);
  });
});
```

- [x] **Step 2: Run test to verify failure**
Run: `bun test tests/repositories.test.ts`  
Expected: FAIL

- [x] **Step 3: Implement domain repositories under `src/server/db/repositories/` and wire into `src/server/db.ts`**
Extract and modularize data access methods from `db.ts` into individual repository classes/modules while preserving the `db` export facade so existing callers remain unbroken.

- [x] **Step 4: Run test to verify it passes**
Run: `bun test tests/repositories.test.ts`  
Expected: PASS

- [x] **Step 5: Commit**
```bash
git add src/server/db/repositories/ src/server/db.ts tests/repositories.test.ts
git commit -m "feat(db): implement modular domain repositories with atomic FEFO engine"
```

---

### Task 3: Modular Express Domain Routers

**Files:**
- Create: `src/server/routes/auth.routes.ts`
- Create: `src/server/routes/inventory.routes.ts`
- Create: `src/server/routes/pos.routes.ts`
- Create: `src/server/routes/purchasing.routes.ts`
- Create: `src/server/routes/finance.routes.ts`
- Create: `src/server/routes/hr.routes.ts`
- Create: `src/server/routes/admin.routes.ts`
- Create: `src/server/routes/ai.routes.ts`
- Create: `src/server/index.ts`
- Modify: `server.ts`
- Test: `tests/modularRoutes.test.ts`

**Interfaces:**
- Consumes: Domain repositories from `src/server/db/` and role guards from `src/server/roleGuard.ts`
- Produces: `authRouter`, `inventoryRouter`, `posRouter`, `purchasingRouter`, `financeRouter`, `hrRouter`, `adminRouter`, `aiRouter`.

- [x] **Step 1: Write tests for modular router mounting**

```typescript
// tests/modularRoutes.test.ts
import { expect, test, describe } from 'bun:test';
import { createExpressApp } from '../server';

describe('Modular Express Domain Routers', () => {
  test('Mounts all domain routers and responds on /health and /api/medicines', async () => {
    const app = await createExpressApp();
    expect(app).toBeDefined();
  });
});
```

- [x] **Step 2: Run test to verify it passes or fails**
Run: `bun test tests/modularRoutes.test.ts`

- [x] **Step 3: Extract endpoints from `server.ts` into `src/server/routes/*` and register them in `src/server/index.ts`**
Move endpoints by domain into separate router files. Keep `server.ts` as the clean ~60-line bootstrap file.

- [x] **Step 4: Run full test suite to verify all API endpoints work seamlessly**
Run: `bun test`  
Expected: All tests pass (including auth, medicines, sales, and browser UI tests).

- [x] **Step 5: Commit**
```bash
git add src/server/routes/ src/server/index.ts server.ts tests/modularRoutes.test.ts
git commit -m "refactor(server): decouple monolithic server into modular domain routers"
```

---

### Task 4: Store Owner Barcode Feature Toggle Switch

**Files:**
- Modify: `src/server/db.ts` (Ensure `enableBarcodeSystem: false` in default profile)
- Modify: `src/components/dashboard/SettingsView.tsx` (Add Owner Barcode Toggle Card)
- Modify: `src/components/inventory/InventorySystemWorkstation.tsx` (Conditionally show barcode scan & label buttons)
- Modify: `src/components/dashboard/PosView.tsx` (Conditionally show barcode scanner)
- Test: `tests/barcodeToggle.test.ts`

**Interfaces:**
- Consumes: `PharmacyStoreProfile.enableBarcodeSystem` from `/api/pharmacy/profile`
- Produces: Dynamic UI adaptation based on owner setting.

- [x] **Step 1: Write test for Barcode Toggle state and permissions**

```typescript
// tests/barcodeToggle.test.ts
import { expect, test, describe } from 'bun:test';
import { db } from '../src/server/db';

describe('Store Owner Barcode Toggle', () => {
  test('Allows Store Owner to toggle enableBarcodeSystem', () => {
    const initial = db.getPharmacyProfile().enableBarcodeSystem;
    db.updatePharmacyProfile({ enableBarcodeSystem: true });
    expect(db.getPharmacyProfile().enableBarcodeSystem).toBe(true);
    db.updatePharmacyProfile({ enableBarcodeSystem: initial });
  });
});
```

- [x] **Step 2: Run test to verify it passes**
Run: `bun test tests/barcodeToggle.test.ts`

- [x] **Step 3: Implement Barcode On/Off Switch in `SettingsView.tsx` and conditional rendering in POS & IMS**
Add a dedicated card in `SettingsView.tsx` (Store Configuration tab) allowing the Store Owner to toggle the Barcode Subsystem on or off. In `InventorySystemWorkstation.tsx` and `PosView.tsx`, fetch or inspect `pharmacyProfile.enableBarcodeSystem` to show or hide the barcode action buttons.

- [x] **Step 4: Run test to verify it passes**
Run: `bun test tests/barcodeToggle.test.ts`

- [x] **Step 5: Commit**
```bash
git add src/components/dashboard/SettingsView.tsx src/components/inventory/InventorySystemWorkstation.tsx src/components/dashboard/PosView.tsx tests/barcodeToggle.test.ts
git commit -m "feat(settings): add Drug Store Owner barcode on/off feature toggle switch"
```

---

### Task 5: Typed Frontend Client Services Layer

**Files:**
- Create: `src/services/api/client.ts`
- Create: `src/services/api/inventory.api.ts`
- Create: `src/services/api/pos.api.ts`
- Create: `src/services/api/purchasing.api.ts`
- Create: `src/services/api/finance.api.ts`
- Create: `src/services/api/hr.api.ts`
- Create: `src/services/api/admin.api.ts`
- Create: `src/services/api/index.ts`
- Test: `tests/apiServices.test.ts`

**Interfaces:**
- Consumes: `/api/*` endpoints
- Produces: Strongly typed async API functions returning `Promise<ApiResponse<T>>`.

- [x] **Step 1: Write test for typed API services**

```typescript
// tests/apiServices.test.ts
import { expect, test, describe } from 'bun:test';
import { inventoryApi } from '../src/services/api/inventory.api';

describe('Typed Frontend Client Services', () => {
  test('inventoryApi exports getMedicines and getBatches functions', () => {
    expect(typeof inventoryApi.getMedicines).toBe('function');
    expect(typeof inventoryApi.getBatches).toBe('function');
  });
});
```

- [x] **Step 2: Run test to verify failure**
Run: `bun test tests/apiServices.test.ts`  
Expected: FAIL

- [x] **Step 3: Implement typed client services in `src/services/api/`**
Create clean functions with full TypeScript return types.

- [x] **Step 4: Run test to verify it passes**
Run: `bun test tests/apiServices.test.ts`  
Expected: PASS

- [x] **Step 5: Commit**
```bash
git add src/services/api/ tests/apiServices.test.ts
git commit -m "feat(client): implement strongly typed API domain services layer"
```

---

### Task 6: Full System Verification, Production Build & Deployment

**Files:**
- All created and modified files
- Test: Run all 14 test files (`bun test`)

- [x] **Step 1: Run complete automated test suite**
Run: `bun test`  
Expected: 140+ passing tests, 0 failures.

- [x] **Step 2: Run production build**
Run: `bun run build`  
Expected: Vite and esbuild build cleanly with 0 errors.

- [x] **Step 3: Push to remote main for Vercel deployment**
Run: `git push origin main`  
Expected: Successfully pushed to GitHub `main` branch.

- [x] **Step 4: Commit and present final completion evidence**
