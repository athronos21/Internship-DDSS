# Standalone Inventory Management System (IMS) & Workstation Switcher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign Inventory Management into an autonomous, dedicated standalone workstation (`InventorySystemWorkstation`) accessible through a specialized "Workstations & Systems" dropdown inside the staff and drug store owner dashboards.

**Architecture:** Create a reusable `WorkstationDropdown` component for the dashboard header, create a dedicated `InventorySystemWorkstation` component with its own focused top-bar, KPIs, and 6 inventory subsystems, and integrate them into `DashboardLayout.tsx` and `App.tsx` with smooth bidirectional routing for Store Owners and Pharmacists.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Lucide React, Bun test suite, Vite.

**Spec:** `C:\Users\Nythor\.gemini\antigravity-cli\brain\a4d3ddd4-983d-4d5e-a1b0-89e91b4d6718\inventory_system_redesign_spec.md`

## Global Constraints
- Available strictly to authenticated staff (**Store Owners**, **Pharmacists**, and **Super Admins**).
- Accessible strictly inside the dashboard header bar (never exposed on the public customer storefront).
- 100% preservation of all existing inventory features (FEFO batch allocations, barcode scanner, CSV importer, Code-128 generator, stock adjustments, and ML forecasting).
- All 112 existing automated tests must continue passing without regression.

## Review Focus
1. **Dropdown Dismissal:** Clicking outside the workstation dropdown or pressing Escape must close the menu immediately.
2. **Role Compatibility:** Pharmacists and Store Owners must both be able to open and navigate the IMS without RBAC authorization locks.
3. **Sub-Item Deep Linking:** Selecting a specific sub-item (e.g., "Batch Expiry & FEFO" or "Barcode Studio") from the dropdown must jump directly to that active sub-tab inside the IMS.
4. **Bidirectional Navigation:** From inside the standalone IMS, clicking "Back to Store Dashboard" or selecting POS must cleanly return without page reloads.
5. **Mobile Responsiveness:** The dropdown and workstation layout must adapt cleanly on tablet and mobile viewports.

---

### Task 1: Create `WorkstationDropdown.tsx`

**Files:**
- Create: `src/components/dashboard/WorkstationDropdown.tsx`
- Modify: `src/components/dashboard/DashboardLayout.tsx:730-760`
- Test: `tests/workstationDropdown.test.ts`

**Interfaces:**
- Produces:
  ```ts
  interface WorkstationDropdownProps {
    currentUser: User;
    currentWorkstation: 'STORE_OPS' | 'IMS' | 'POS' | 'MASTER_ADMIN';
    onSelectWorkstation: (workstation: 'STORE_OPS' | 'IMS' | 'POS' | 'MASTER_ADMIN', subTab?: string) => void;
  }
  ```

- [ ] **Step 1: Write unit test for `WorkstationDropdown` in `tests/workstationDropdown.test.ts`**
  Verify component renders available workstations, respects roles (hides Master Admin for non-superadmins), and triggers navigation callback on selection.

- [ ] **Step 2: Run test to verify it fails**
  Run: `bun test tests/workstationDropdown.test.ts`
  Expected: FAIL (module not found)

- [ ] **Step 3: Implement `src/components/dashboard/WorkstationDropdown.tsx`**
  - Create the dropdown button with workstation icon, chevron, and active badge.
  - Create the popover menu with sections:
    - 📦 **Inventory Management System (IMS)** (Dedicated standalone workstation)
      - Quick jumps: 💊 Formulary Catalog, 🏷️ Batch & FEFO Expiry, ⚖️ Stock Adjustments, 📋 Requisitions, 📷 Barcode Studio
    - 💳 **POS Dispensing Terminal** (Counter sales)
    - 🏪 **Store Management Portal** (Overview, purchases, HR, financials)
    - 👑 **National Fleet Governance** (Super Admin only)
  - Include outside click listener and Escape key dismiss.

- [ ] **Step 4: Run test to verify it passes**
  Run: `bun test tests/workstationDropdown.test.ts`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/dashboard/WorkstationDropdown.tsx tests/workstationDropdown.test.ts
  git commit -m "feat(ui): add WorkstationDropdown switcher component"
  ```

---

### Task 2: Build `InventorySystemWorkstation.tsx` (Dedicated Standalone IMS)

**Files:**
- Create: `src/components/inventory/InventorySystemWorkstation.tsx`
- Test: `tests/inventoryWorkstation.test.ts`

**Interfaces:**
- Produces:
  ```ts
  interface InventorySystemWorkstationProps {
    currentUser: User;
    initialSubTab?: 'medicines' | 'batches' | 'adjustments' | 'requests' | 'movements' | 'forecast';
    onExitToDashboard: () => void;
    onSwitchWorkstation: (workstation: 'STORE_OPS' | 'POS' | 'MASTER_ADMIN') => void;
  }
  ```

- [ ] **Step 1: Write test for `InventorySystemWorkstation` in `tests/inventoryWorkstation.test.ts`**
  Verify that the workstation mounts, renders live KPI summary cards, switches between the 6 sub-tabs, and provides the exit button back to the dashboard.

- [ ] **Step 2: Run test to verify it fails**
  Run: `bun test tests/inventoryWorkstation.test.ts`
  Expected: FAIL

- [ ] **Step 3: Implement `src/components/inventory/InventorySystemWorkstation.tsx`**
  - **IMS Specialized Header:**
    - Title: Kaziniya IMS (Inventory Management System) & EFDA Digital Controller
    - Live KPI badges: Active SKUs, Stock Valuation (ETB), Expiring Soon Batches, Low Stock Count
    - Quick Action Toolbelt: Live Camera Scanner trigger, Code-128 Generator modal, CSV Import modal, "+ Register New Medicine" modal
    - "Exit to Store Dashboard" button and workstation switcher menu
  - **6 Dedicated Subsystem Tabs:**
    1. Formulary & Medicines Catalog (with search, category filter, dosage forms, stock status)
    2. Batch & FEFO Expiry Control (FEFO badge countdowns, batch quarantine)
    3. Audits & Physical Count Adjustments (physical recount corrections, damage write-offs)
    4. Internal Requisitions & Transfers (shelf-to-counter requests, status tracking)
    5. Stock Movement Ledger (immutable audit trail of warehouse transactions)
    6. AI Demand & Stockout Forecasting (ML safety stock curves, reorder suggestions)

- [ ] **Step 4: Run test to verify it passes**
  Run: `bun test tests/inventoryWorkstation.test.ts`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/inventory/InventorySystemWorkstation.tsx tests/inventoryWorkstation.test.ts
  git commit -m "feat(ims): build standalone InventorySystemWorkstation component"
  ```

---

### Task 3: Integrate Workstation Dropdown & Routing in `DashboardLayout.tsx` & `App.tsx`

**Files:**
- Modify: `src/components/dashboard/DashboardLayout.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Add WorkstationDropdown into `DashboardLayout.tsx` header**
  - Place `WorkstationDropdown` in the top header bar next to the date/portal buttons.
  - Wire selection to trigger `onNavigateSubItem` or `setActiveView('inventory_system')`.

- [ ] **Step 2: Support `inventory_system` view in `src/App.tsx`**
  - Add `inventory_system` to `dashboardView` state.
  - Mount `<InventorySystemWorkstation>` when `dashboardView === 'inventory_system'`.
  - Wire `onExitToDashboard` to return to `dashboardView === 'dashboard'`.
  - Wire `onSwitchWorkstation` to switch to `'pos'`, `'dashboard'`, or `'master_admin'`.
  - Handle URL query parameter `?view=inventory_system` and `?tab=...` on load.

- [ ] **Step 3: Verify navigation flows**
  - Test switching from Store Dashboard to Standalone IMS.
  - Test switching from POS to Standalone IMS.
  - Test returning from Standalone IMS to Store Dashboard.
  - Verify access for both Store Owner (`admin@kaziniya.com`) and Pharmacist (`munaa7536@gmail.com`).

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/dashboard/DashboardLayout.tsx src/App.tsx
  git commit -m "feat(navigation): integrate standalone IMS workstation and header dropdown"
  ```

---

### Task 4: Complete Verification, Build, & Deployment

**Files:**
- Modify: `tests/e2eVerification.test.ts`

- [ ] **Step 1: Add automated tests for IMS workstation routing in `tests/e2eVerification.test.ts`**
  - Verify `/api/medicines` and `/api/batches` provide required data to IMS workstation.
  - Verify Store Owner and Pharmacist session compatibility.

- [ ] **Step 2: Run full test suite with `bun test`**
  Run: `bun test`
  Expected: All 112+ tests PASS with 0 failures.

- [ ] **Step 3: Build production bundle with `bun run build`**
  Run: `bun run build`
  Expected: Vite and esbuild build succeeds cleanly.

- [ ] **Step 4: Git commit & push to GitHub**
  ```bash
  git commit -am "feat(ims): complete standalone inventory system and workstation dropdown"
  git push origin main
  ```

- [ ] **Step 5: Verify live Vercel deployment**
  Test live URL `https://internship-ddss-athronos21s-projects.vercel.app/` to confirm live production readiness.
