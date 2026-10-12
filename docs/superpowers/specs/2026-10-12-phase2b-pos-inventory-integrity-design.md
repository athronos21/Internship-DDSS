# Phase 2B: Transactional POS & Inventory Integrity Design Specification

**Status:** Approved  
**Author:** Antigravity  
**Date:** 2026-10-12  
**Target Milestone:** Phase 2B (POS Pricing, Concurrency Safety, and Inventory Integrity)  

---

## 1. Problem Statement & Audit Context

The updated security audit identified critical vulnerabilities in point-of-sale processing, inventory mutations, and public order creation:

1. **Client-Supplied POS Pricing (`POST /api/sales`)**:
   - `processSaleTransaction` in `src/server/db.ts` accepts client-supplied `unitPrice` (`const itemPrice = inputItem.unitPrice || alloc.unitPrice;`).
   - A client can submit arbitrary low or zero unit prices, leading to financial loss and fraudulent dispensation.
2. **Missing Quantity & Discount Boundaries**:
   - Quantities are not checked for positive integers. Negative quantities or float values can manipulate stock counts or reverse charges.
   - Discretionary discounts are unbounded, permitting 100%+ reductions without authorization.
3. **Inventory Allocation & Concurrency Race Conditions**:
   - When a sale cart contains multiple lines with the same `medicineId`, FEFO stock checks evaluate each line independently without aggregating demand, permitting overselling and negative stock balances.
   - Concurrent requests executing simultaneously can double-allocate the same batch units.
4. **Public Storefront Order Integrity (`POST /api/orders`)**:
   - Anyone can submit arbitrary items and client-declared `totalAmount`.
   - Medicine existence, active status, and catalog selling prices are not verified on the server.
   - Orders are stored in a loose array without repository encapsulation or lifecycle transition validation.

---

## 2. Core Architectural Principles

1. **Zero Client Price Trust**: The server is the single source of truth for all catalog and batch pricing. Any client-sent `unitPrice` or `totalAmount` is ignored and recomputed server-side.
2. **Strict Arithmetic & Quantity Boundaries**: Quantities must be strictly positive integers $\in [1, 10000]$. Line discounts cannot exceed line subtotal; total cart discounts cannot exceed institutional policy (20% of subtotal) without supervisor override.
3. **Atomic Multi-Item FEFO Allocation**: Cart items are pre-aggregated by `medicineId`. Stock availability across all batches is validated before any mutation begins. If any deduction fails, all state is rolled back cleanly.
4. **Concurrency Serialization**: In-memory state mutations are wrapped in a serialized transaction lock (`withTransactionLock`) to prevent race conditions during high-volume dispensing.
5. **Enforced Order Lifecycle**: Public orders derive prices from the active catalog and enforce strict status transition state machines.

---

## 3. Detailed Component Design

### 3.1 Server-Authoritative POS Pricing (`POST /api/sales`)

#### Input Contract
```typescript
interface ProcessSaleInput {
  items: Array<{
    medicineId: string;
    quantity: number;
    discount?: number; // Optional line discount in ETB
  }>;
  paymentMethod: 'CASH' | 'TELEBIRR' | 'CBE_BIRR' | 'CREDIT' | 'BANK_TRANSFER';
  customerName?: string;
  customerPhone?: string;
  discount?: number; // Optional overall cart discount in ETB
  soldByUserId: string;
}
```

#### Validation & Price Computation Pipeline
1. **Cart Non-Empty Check**: `items` must be a non-empty array ($\le 100$ items).
2. **Quantity Validation**: For every item:
   - Check `Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 10000`.
   - Rejects non-integers, negative numbers, or zero with `400 Bad Request`.
3. **Pre-Aggregation by Medicine**:
   - Group cart items by `medicineId` to compute `totalRequiredPerMedicine`.
   - For each distinct medicine, verify that non-expired batch stock $\ge$ total required quantity.
4. **FEFO Allocation & Split-Batch Price Derivation**:
   - For each allocated batch, record:
     - `batchId`: Target batch identifier
     - `batchNumber`: Unique batch code
     - `expiryDate`: ISO date string
     - `qtyDeducted`: Number of units allocated from this batch
     - `unitPrice`: Authoritative `batch.sellingPrice`
     - `unitCost`: Authoritative `batch.purchasePrice`
   - If a line spans multiple batches with differing selling prices (e.g. batch A @ 50 ETB, batch B @ 55 ETB), each sub-allocation records its exact batch selling price.
5. **Discount Policy Enforcement**:
   - **Line Discount**: Must satisfy `0 <= lineDiscount <= lineSubtotal`.
   - **Cart Overall Discount**: Must satisfy `0 <= overallDiscount <= (0.20 * cartSubtotal)`. If `overallDiscount > 0.20 * cartSubtotal`, reject with `400 Bad Request` ("Discretionary cashier discount cannot exceed 20% of cart subtotal").
6. **Final Financial Totals**:
   - `subtotal = sum(item.totalPrice)`
   - `totalDiscount = lineDiscounts + overallDiscount`
   - `totalAmount = Math.round((subtotal - overallDiscount) * 100) / 100`
   - Guarantee `totalAmount >= 0`.

---

### 3.2 Transactional Concurrency & Atomic Stock Deduction

#### In-Memory Mutex Lock (`withTransactionLock`)
```typescript
let transactionLock = Promise.resolve();

export async function withTransactionLock<T>(fn: () => Promise<T> | T): Promise<T> {
  const nextLock = transactionLock.then(async () => {
    return await fn();
  });
  transactionLock = nextLock.catch(() => {});
  return nextLock;
}
```

#### Atomic Rollback Mechanism
1. Create a snapshot copy of all affected batches:
   ```typescript
   const batchSnapshots = new Map<string, number>();
   ```
2. Deduct stock across all batches:
   ```typescript
   for (const alloc of allAllocations) {
     const batch = medicineBatches.find(b => b.id === alloc.batchId);
     if (!batch || batch.currentQuantity < alloc.qtyDeducted) {
       // Rollback all mutated batches to snapshot
       for (const [bId, prevQty] of batchSnapshots.entries()) {
         const b = medicineBatches.find(x => x.id === bId);
         if (b) b.currentQuantity = prevQty;
       }
       throw new Error(`Atomic stock allocation failed for batch ${alloc.batchId}`);
     }
     batchSnapshots.set(batch.id, batch.currentQuantity);
     batch.currentQuantity -= alloc.qtyDeducted;
     batch.updatedAt = new Date().toISOString();
   }
   ```
3. Record `InventoryTransaction` audit entries with `referenceType: 'SALE'` and `referenceId: invoiceNumber`.
4. Record `Sale` invoice and append to `sales` collection.
5. Record `AuditLog` entry for completed sale.

---

### 3.3 Public Storefront Orders (`POST /api/orders`)

#### Endpoint Behavior
- **Public Access**: Unauthenticated customers can create prescription orders.
- **Server Catalog Price Derivation**:
  - For each ordered item, look up `MedicineRepository.findById(item.medicineId)`.
  - Reject order if medicine does not exist or is inactive (`400 Bad Request`).
  - Retrieve active selling price from catalog: `med.sellingPrice`.
  - Calculate `lineTotal = item.quantity * med.sellingPrice`.
  - Calculate server-authoritative `totalAmount = sum(lineTotals)`.
  - Discard any client-supplied `totalAmount`.
- **Order Lifecycle Status Machine**:
  - `PENDING_DISPENSATION` $\rightarrow$ `CONFIRMED` $\rightarrow$ `DISPENSED`
  - Any status $\rightarrow$ `CANCELLED`
  - Rejects invalid status jumps (e.g. `CANCELLED` $\rightarrow$ `DISPENSED`) with `400 Bad Request`.
- **Encapsulation**:
  - Move orders from loose module array in `pos.routes.ts` into a structured `OrderRepository` in `src/server/db/repositories/order.repository.ts`.

---

## 4. File Changes & Interface Modifications

| File | Change |
| :--- | :--- |
| `src/server/db.ts` | Refactor `allocateFefoStock` to accept aggregated multi-item checks; refactor `processSaleTransaction` to ignore client unit prices, enforce discount limits, enforce integer quantities, and execute atomic rollback on failure. Add `withTransactionLock`. |
| `src/server/routes/pos.routes.ts` | Validate request body in `POST /api/sales` (positive integers, non-empty cart, payment method). Refactor `POST /api/orders` to derive server prices and use `OrderRepository`. Add status transition validation in `PATCH /api/orders/:id`. |
| `src/server/db/repositories/sales.repository.ts` | Pass validated parameters to `db.processSaleTransaction`. |
| `src/server/db/repositories/order.repository.ts` | New domain repository managing orders collection, status transitions, and ID generation. |
| `tests/api.test.ts` | Update existing integration test fixture to align with catalog selling price. |
| `tests/posPricingSecurity.test.ts` | New test suite verifying server-authoritative pricing, tamper rejection, quantity validation, discount caps, concurrency safety, and order calculation. |

---

## 5. Security & Verification Acceptance Criteria

1. **Price Tampering Rejection**: Client sending `unitPrice: 0.01` on a 85 ETB medicine has its sale recorded at 85 ETB, with `totalAmount` matching server calculation.
2. **Negative/Float Quantity Rejection**: Carts containing `quantity: -5`, `quantity: 0`, or `quantity: 2.5` receive `400 Bad Request`.
3. **Discount Boundary Enforcement**:
   - Line discount exceeding line subtotal returns `400 Bad Request`.
   - Overall discount exceeding 20% of subtotal returns `400 Bad Request`.
4. **Duplicate Medicine Line Aggregation**: A cart with two separate lines for the same medicine requesting 10 and 10 units when only 15 exist fails cleanly with `400 Bad Request` and mutates 0 stock.
5. **Order Price Derivation**: Public `POST /api/orders` with `totalAmount: 1` on 200 ETB medicines records `totalAmount: 200`.
6. **Order Status Transition Guards**: `PATCH /api/orders/:id` rejects invalid state transitions.
7. **Regression Guarantee**: All existing 215 tests pass.
