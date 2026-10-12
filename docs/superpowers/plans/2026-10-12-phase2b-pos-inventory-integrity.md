# Phase 2B: Transactional POS & Inventory Integrity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enforce server-authoritative POS pricing, positive integer quantity bounds, discretionary discount caps, atomic FEFO stock deductions with serialized concurrency locks, and server-side public order price derivation.

**Architecture:** Refactor `processSaleTransaction` in `src/server/db.ts` and `pos.routes.ts` to ignore client unit prices and derive all financial values directly from allocated batch records; wrap in-memory mutations in a serialized transaction lock with atomic snapshot rollback; encapsulate storefront orders in `OrderRepository` with catalog price calculation and lifecycle state machine guards.

**Tech Stack:** Express.js, TypeScript, Bun runtime, Node.js.

**Spec:** [`docs/superpowers/specs/2026-10-12-phase2b-pos-inventory-integrity-design.md`](file:///C:/Users/Nythor/Desktop/ISP2026/Internship-DDSS/docs/superpowers/specs/2026-10-12-phase2b-pos-inventory-integrity-design.md)

## Global Constraints

- Never accept client-supplied `unitPrice` or `totalAmount` in `POST /api/sales` or `POST /api/orders`; calculate strictly from server batch/catalog records.
- Require all item quantities to be positive integers ($1 \le q \le 10,000$).
- Reject line discounts exceeding line subtotal with `400 Bad Request`.
- Reject overall cart discounts exceeding 20% of cart subtotal with `400 Bad Request`.
- Ensure multi-line cart items for the same medicine aggregate demand before FEFO allocation.
- Serialize inventory mutations via `withTransactionLock` and roll back batch snapshots if any deduction fails.
- Enforce valid order status transitions (`PENDING_DISPENSATION` $\rightarrow$ `CONFIRMED` $\rightarrow$ `DISPENSED`, or `CANCELLED`).
- Maintain clean TypeScript compilation (`tsc --noEmit`) and 100% test pass across the test suite.

## Review Focus

1. `POST /api/sales` with client `unitPrice: 0.01` on an 85 ETB medicine records 85 ETB and ignores the client price.
2. `POST /api/sales` with `quantity: 0`, `quantity: -3`, or `quantity: 1.5` returns `400 Bad Request`.
3. `POST /api/sales` with overall discount $> 20\%$ of subtotal returns `400 Bad Request`.
4. A cart with duplicate lines for a medicine whose total demand exceeds available stock aborts cleanly with 0 stock deducted.
5. `POST /api/orders` with client `totalAmount: 1` recalculates real total from catalog selling prices.

---

### Task 1: Server-Authoritative POS Pricing & Quantity/Discount Validation (`POST /api/sales`)

**Files:**
- Modify: `src/server/db.ts:1362-1526`
- Modify: `src/server/routes/pos.routes.ts:28-53`
- Test: `tests/posPricingSecurity.test.ts`

**Interfaces:**
- Consumes: `allocateFefoStock` from `src/server/db.ts`, `medicineBatches` from `src/server/db.ts`
- Produces: Hardened `processSaleTransaction` and `POST /api/sales` ignoring client prices and validating quantity/discount limits

- [ ] **Step 1: Write failing tests in `tests/posPricingSecurity.test.ts`**

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { startServer } from '../src/server/index';
import { db } from '../src/server/db';
import { auth } from '../src/server/auth';
import type { Server } from 'http';

describe('POS Pricing & Quantity Security (POST /api/sales)', () => {
  const TEST_PORT = 5694;
  const baseUrl = `http://localhost:${TEST_PORT}`;
  let serverInstance: Server;
  let cashierToken: string = '';

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const result = await startServer(TEST_PORT);
    serverInstance = result.server;

    const signin = await auth.api.signInEmail({
      body: { email: 'pharmacist@kaziniya.com', password: 'Password123!' },
    });
    cashierToken = signin.token;
  });

  afterAll(() => {
    serverInstance?.close();
  });

  it('rejects sale with zero or negative quantity with 400 Bad Request', async () => {
    const med = db.getCalculatedMedicines().find((m) => (m.totalStock || 0) > 0)!;
    const res = await fetch(`${baseUrl}/api/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cashierToken}`,
      },
      body: JSON.stringify({
        items: [{ medicineId: med.id, quantity: -2 }],
        paymentMethod: 'CASH',
      }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('rejects sale with non-integer floating quantity with 400 Bad Request', async () => {
    const med = db.getCalculatedMedicines().find((m) => (m.totalStock || 0) > 0)!;
    const res = await fetch(`${baseUrl}/api/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cashierToken}`,
      },
      body: JSON.stringify({
        items: [{ medicineId: med.id, quantity: 2.5 }],
        paymentMethod: 'CASH',
      }),
    });
    expect(res.status).toBe(400);
  });

  it('ignores client unit price and derives price strictly from batch sellingPrice', async () => {
    const med = db.getCalculatedMedicines().find((m) => (m.totalStock || 0) > 2)!;
    const expectedBatchPrice = med.sellingPrice!;
    expect(expectedBatchPrice).toBeGreaterThan(0);

    const res = await fetch(`${baseUrl}/api/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cashierToken}`,
      },
      body: JSON.stringify({
        items: [{ medicineId: med.id, quantity: 1, unitPrice: 0.01 }], // Tampered unit price
        paymentMethod: 'CASH',
        customerName: 'Tamper Test Customer',
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.items[0].unitPrice).toBe(expectedBatchPrice);
    expect(body.data.totalAmount).toBe(expectedBatchPrice);
  });

  it('rejects overall cart discount exceeding 20% limit with 400 Bad Request', async () => {
    const med = db.getCalculatedMedicines().find((m) => (m.totalStock || 0) > 0)!;
    const subtotal = med.sellingPrice!;

    const res = await fetch(`${baseUrl}/api/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cashierToken}`,
      },
      body: JSON.stringify({
        items: [{ medicineId: med.id, quantity: 1 }],
        paymentMethod: 'CASH',
        discount: subtotal * 0.5, // 50% discount exceeds 20% limit
      }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('accepts valid sale with discount <= 20% and calculates total accurately', async () => {
    const med = db.getCalculatedMedicines().find((m) => (m.totalStock || 0) > 0)!;
    const expectedPrice = med.sellingPrice!;
    const allowableDiscount = Math.round(expectedPrice * 0.1 * 100) / 100; // 10% discount

    const res = await fetch(`${baseUrl}/api/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cashierToken}`,
      },
      body: JSON.stringify({
        items: [{ medicineId: med.id, quantity: 1 }],
        paymentMethod: 'CASH',
        discount: allowableDiscount,
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.totalAmount).toBe(Math.round((expectedPrice - allowableDiscount) * 100) / 100);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test tests/posPricingSecurity.test.ts`  
Expected: FAIL because client unit price is currently accepted and discounts/quantities are unvalidated.

- [ ] **Step 3: Refactor `processSaleTransaction` in `src/server/db.ts` & validation in `src/server/routes/pos.routes.ts`**

Implement:
- In `pos.routes.ts`: Validate that `items` is non-empty array ($\le 100$), every item has positive integer quantity `Number.isInteger(q) && q >= 1 && q <= 10000`, and `paymentMethod` is valid.
- In `src/server/db.ts`: In `processSaleTransaction`:
  - Discard `inputItem.unitPrice`. Strictly use `alloc.unitPrice` from batch.
  - Compute `lineTotal = alloc.qtyDeducted * alloc.unitPrice - lineDiscount`.
  - Validate `overallDiscount >= 0 && overallDiscount <= (0.20 * subtotal)`. If greater, throw `new Error('Discretionary cashier discount cannot exceed 20% of cart subtotal.')`.
  - Calculate `totalAmount = Math.round((subtotal - overallDiscount) * 100) / 100`.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test tests/posPricingSecurity.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/db.ts src/server/routes/pos.routes.ts tests/posPricingSecurity.test.ts
git commit -m "feat(pos): enforce server-authoritative batch pricing, positive integer quantities, and discount caps"
```

---

### Task 2: Transactional In-Memory Locking & Atomic Stock Rollback

**Files:**
- Modify: `src/server/db.ts:1350-1526`
- Test: `tests/posInventoryAtomicity.test.ts`

**Interfaces:**
- Consumes: `withTransactionLock`, `medicineBatches`
- Produces: Serialized, atomic `processSaleTransaction` with cart medicine aggregation and complete rollback on allocation failure

- [ ] **Step 1: Write failing tests in `tests/posInventoryAtomicity.test.ts`**

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { startServer } from '../src/server/index';
import { db } from '../src/server/db';
import { auth } from '../src/server/auth';
import type { Server } from 'http';

describe('POS Inventory Atomicity & Concurrency (POST /api/sales)', () => {
  const TEST_PORT = 5695;
  const baseUrl = `http://localhost:${TEST_PORT}`;
  let serverInstance: Server;
  let cashierToken: string = '';

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const result = await startServer(TEST_PORT);
    serverInstance = result.server;

    const signin = await auth.api.signInEmail({
      body: { email: 'pharmacist@kaziniya.com', password: 'Password123!' },
    });
    cashierToken = signin.token;
  });

  afterAll(() => {
    serverInstance?.close();
  });

  it('aggregates multiple cart lines for the same medicine and rejects atomically if total stock is exceeded', async () => {
    const med = db.getCalculatedMedicines().find((m) => (m.totalStock || 0) > 0)!;
    const initialStock = med.totalStock!;

    // Attempt to buy more than total stock using two lines
    const qty1 = Math.ceil(initialStock * 0.7);
    const qty2 = Math.ceil(initialStock * 0.6); // Total > initialStock

    const res = await fetch(`${baseUrl}/api/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cashierToken}`,
      },
      body: JSON.stringify({
        items: [
          { medicineId: med.id, quantity: qty1 },
          { medicineId: med.id, quantity: qty2 },
        ],
        paymentMethod: 'CASH',
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);

    // Verify ZERO stock was deducted (atomic rollback)
    const afterStock = db.getCalculatedMedicines().find((m) => m.id === med.id)!.totalStock;
    expect(afterStock).toBe(initialStock);
  });

  it('rolls back all earlier items if a subsequent cart item fails validation or stock', async () => {
    const meds = db.getCalculatedMedicines().filter((m) => (m.totalStock || 0) > 3);
    const med1 = meds[0];
    const med2 = meds[1];

    const initialStock1 = med1.totalStock!;
    const initialStock2 = med2.totalStock!;

    const res = await fetch(`${baseUrl}/api/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cashierToken}`,
      },
      body: JSON.stringify({
        items: [
          { medicineId: med1.id, quantity: 2 },
          { medicineId: med2.id, quantity: 9999 }, // Will fail on med2
        ],
        paymentMethod: 'CASH',
      }),
    });

    expect(res.status).toBe(400);

    // Verify med1 stock was NOT deducted
    const afterStock1 = db.getCalculatedMedicines().find((m) => m.id === med1.id)!.totalStock;
    const afterStock2 = db.getCalculatedMedicines().find((m) => m.id === med2.id)!.totalStock;

    expect(afterStock1).toBe(initialStock1);
    expect(afterStock2).toBe(initialStock2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test tests/posInventoryAtomicity.test.ts`  
Expected: FAIL because cart items are evaluated independently without demand pre-aggregation, leading to over-allocation or partial deduction.

- [ ] **Step 3: Implement cart aggregation and snapshot rollback in `src/server/db.ts`**

Implement:
- Add `withTransactionLock` serialization in `src/server/db.ts`.
- Pre-aggregate cart items:
  ```typescript
  const aggregatedDemand = new Map<string, number>();
  for (const item of saleData.items) {
    aggregatedDemand.set(item.medicineId, (aggregatedDemand.get(item.medicineId) || 0) + item.quantity);
  }
  for (const [medId, totalQty] of aggregatedDemand.entries()) {
    allocateFefoStock(medId, totalQty); // Pre-flight check on aggregated demand
  }
  ```
- Wrap deduction in snapshot tracking: if any exception occurs during batch deduction, restore all mutated batches from the snapshot and re-throw.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test tests/posInventoryAtomicity.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/db.ts tests/posInventoryAtomicity.test.ts
git commit -m "feat(inventory): implement cart demand aggregation, serialized transaction locks, and atomic stock rollback"
```

---

### Task 3: Public Order Integrity & OrderRepository (`POST /api/orders` & `PATCH /api/orders/:id`)

**Files:**
- Create: `src/server/db/repositories/order.repository.ts`
- Modify: `src/server/routes/pos.routes.ts:55-98`
- Test: `tests/orderSecurity.test.ts`

**Interfaces:**
- Consumes: `MedicineRepository` from `src/server/db/repositories/medicine.repository.ts`
- Produces: `OrderRepository` providing safe CRUD, catalog price computation, and status lifecycle state transitions

- [ ] **Step 1: Write failing tests in `tests/orderSecurity.test.ts`**

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { startServer } from '../src/server/index';
import { db } from '../src/server/db';
import { auth } from '../src/server/auth';
import type { Server } from 'http';

describe('Public Order Integrity & Lifecycle (POST /api/orders)', () => {
  const TEST_PORT = 5696;
  const baseUrl = `http://localhost:${TEST_PORT}`;
  let serverInstance: Server;
  let pharmacistToken: string = '';

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const result = await startServer(TEST_PORT);
    serverInstance = result.server;

    const signin = await auth.api.signInEmail({
      body: { email: 'pharmacist@kaziniya.com', password: 'Password123!' },
    });
    pharmacistToken = signin.token;
  });

  afterAll(() => {
    serverInstance?.close();
  });

  it('POST /api/orders recalculates totalAmount from medicine catalog prices', async () => {
    const med = db.getCalculatedMedicines().find((m) => (m.totalStock || 0) > 0)!;
    const catalogPrice = med.sellingPrice!;
    expect(catalogPrice).toBeGreaterThan(0);

    const res = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Online Patient',
        phone: '+251 911 556 778',
        items: [{ medicineId: med.id, quantity: 2, unitPrice: 0.5 }], // Tampered client price
        totalAmount: 1, // Tampered total
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.totalAmount).toBe(catalogPrice * 2);
    expect(body.data.items[0].unitPrice).toBe(catalogPrice);
  });

  it('POST /api/orders rejects invalid medicine ID with 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Patient',
        phone: '+251 911 000 000',
        items: [{ medicineId: 'non-existent-medicine-id', quantity: 1 }],
      }),
    });
    expect(res.status).toBe(400);
  });

  it('PATCH /api/orders/:id blocks invalid status transition with 400 Bad Request', async () => {
    const med = db.getCalculatedMedicines()[0];
    const createRes = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Transition Test Patient',
        phone: '+251 911 112 233',
        items: [{ medicineId: med.id, quantity: 1 }],
      }),
    });
    const order = (await createRes.json()).data;

    // First cancel the order
    const cancelRes = await fetch(`${baseUrl}/api/orders/${order.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmacistToken}`,
      },
      body: JSON.stringify({ orderStatus: 'CANCELLED' }),
    });
    expect(cancelRes.status).toBe(200);

    // Attempt invalid transition: CANCELLED -> DISPENSED
    const invalidRes = await fetch(`${baseUrl}/api/orders/${order.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmacistToken}`,
      },
      body: JSON.stringify({ orderStatus: 'DISPENSED' }),
    });
    expect(invalidRes.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test tests/orderSecurity.test.ts`  
Expected: FAIL because `totalAmount` is taken directly from the client without catalog lookup, and status transitions are unrestricted.

- [ ] **Step 3: Create `OrderRepository` and update `pos.routes.ts`**

Implement:
- Create `src/server/db/repositories/order.repository.ts`:
  - Manage orders array.
  - Create order with catalog price calculation for each item.
  - Implement `updateStatus(id, newStatus)` with state transition validation:
    - `PENDING_DISPENSATION` $\rightarrow$ `CONFIRMED` | `CANCELLED`
    - `CONFIRMED` $\rightarrow$ `DISPENSED` | `CANCELLED`
    - Terminal states `DISPENSED` and `CANCELLED` cannot transition to other statuses.
- Update `pos.routes.ts` `/orders` endpoints to use `OrderRepository`.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test tests/orderSecurity.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/db/repositories/order.repository.ts src/server/routes/pos.routes.ts tests/orderSecurity.test.ts
git commit -m "feat(orders): implement OrderRepository with catalog price derivation and state machine transition guards"
```

---

### Task 4: Full Regression Verification & Integration Alignment

**Files:**
- Modify: `tests/api.test.ts` (if needed, to match catalog price for test sale)
- Test: All tests across `tests/`

- [ ] **Step 1: Check existing integration test alignment**

Inspect `tests/api.test.ts` line 182-193. Ensure the test item either omits `unitPrice` or expects `med.sellingPrice`.

- [ ] **Step 2: Execute full regression test suite**

Run: `bun test`  
Expected: 100% tests passing across all test files.

- [ ] **Step 3: Execute TypeScript check**

Run: `bun x tsc --noEmit`  
Expected: 0 errors.

- [ ] **Step 4: Execute production bundle build**

Run: `bun run build`  
Expected: Client and server bundles build cleanly with exit code 0.

- [ ] **Step 5: Commit**

```bash
git add tests/ tests/api.test.ts
git commit -m "chore(security): verify full Phase 2B POS & inventory integrity regression suite and production build"
```
