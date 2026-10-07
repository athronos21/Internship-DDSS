# Impeccable UI Craft Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate visual design, typography, spacing, and micro-interactions across the Kaziniya DDSS application using the Impeccable craft engine, strictly preserving 100% of existing content, text, data, and workflows.

**Architecture:** Refinement preserving incumbent identity and behavior. Apply Impeccable craft floor rules: high-contrast clinical palettes, tabular numbers for data/prices/codes, zero gradient text, crisp 1px borders, smooth exponential easing, and responsive layouts.

**Tech Stack:** React 19, TypeScript, TailwindCSS 4, Lucide Icons, Motion (Framer Motion).

**Spec:** [DESIGN.md](file:///C:/Users/Nythor/OneDrive/Desktop/InternProject/DESIGN.md) & [PRODUCT.md](file:///C:/Users/Nythor/OneDrive/Desktop/InternProject/PRODUCT.md)

## Global Constraints
- Strictly preserve 100% of existing content, text, copy, phone numbers, addresses, license IDs, forms, and modals.
- Never delete or simplify any user roles, roster members, or workflow buttons.
- Contrast ratio ≥ 4.5:1 for body text, ≥ 3:1 for large text. Never gray text on colored backgrounds.
- Tabular figures (`font-mono` / `tabular-nums`) for currency, batch numbers, PINs, and telemetry readings.
- All icons from Lucide library with consistent stroke weight.

---

### Task 1: Global Craft Tokens & Foundation (src/index.css)
**Files:**
- Modify: `src/index.css`

- [ ] Add branded selection styles (`::selection`) using clinical teal.
- [ ] Add accessible focus ring styles (`:focus-visible`).
- [ ] Add tabular figures utility class (`.tabular-nums`).
- [ ] Ensure smooth font-smoothing and scrollbar styles.

---

### Task 2: Staff Workstation Gateway Craft Rebuild (src/components/public/DDSGatewayPage.tsx)
**Files:**
- Modify: `src/components/public/DDSGatewayPage.tsx`

- [ ] Elevate left promotional canvas with deep medical sapphire tone, razor-sharp typography, and clean SVG pin/cross backdrop.
- [ ] Refine top bar with EFDA & TIN badges, [Public Customer Portal] and [Mobile POS] launcher buttons.
- [ ] Elevate right authentication card with clean 1px border, smooth depth shadow, and clear active tabs (`Direct Sign In` vs `Active Staff Badges`).
- [ ] Refine PIN and password inputs with monospaced tabular digits, clean focus rings, and eye toggle buttons.
- [ ] Polish active staff badge cards with crisp status dots and role pills.
- [ ] Verify 100% of buttons, roster users, and links remain intact.

---

### Task 3: Public Navigation & Shell Craft Rebuild (src/components/public/Header.tsx & Footer.tsx)
**Files:**
- Modify: `src/components/public/Header.tsx`
- Modify: `src/components/public/Footer.tsx`

- [ ] Refine navigation active indicators with clean pill styling and clear active states.
- [ ] Elevate [Pharmacy Network & Hub] and [Staff Workstation] action buttons with crisp borders and hover feedback.
- [ ] Polish authenticated user dropdown menu with clear role hierarchy (`MASTER ADMIN`, `STORE_OWNER`, `PHARMACIST`).
- [ ] Refine footer layout, branch directory grid, and license badge.
- [ ] Verify all navigation callbacks and modal triggers function smoothly.

---

### Task 4: Public Customer Storefront Craft Rebuild (src/components/public/PublicHome.tsx)
**Files:**
- Modify: `src/components/public/PublicHome.tsx`

- [ ] Eliminate gradient text from hero section in favor of high-contrast bold typography and soft emerald highlight backdrop.
- [ ] Elevate the Cold-Chain IoT Vault Card with authentic hardware sensor readouts, pulsating status diode, and tabular temperature display.
- [ ] Polish the 4 feature cards (`EFDA Certified Quality`, `Cold-Chain Preservation`, `FEFO Batch Management`, `24/7 Emergency Counter`) with balanced padding and refined icons.
- [ ] Polish 24/7 emergency helpline card and B2B pharmacy network CTA banner.
- [ ] Verify all modals (Prescription Upload, Stock Reserve, Emergency Guide) remain completely functional.

---

### Task 5: Public Medicine Catalog Craft Rebuild (src/components/public/PublicProducts.tsx)
**Files:**
- Modify: `src/components/public/PublicProducts.tsx`

- [ ] Refine category filter chips with accessible active contrast and smooth horizontal scrolling.
- [ ] Elevate medicine product cards with crisp 1px borders, subtle depth, high-contrast badges, and tabular pricing.
- [ ] Polish search input with clear icon, search count counter, and instant reset.
- [ ] Verify stock reservation and details modals open smoothly.

---

### Task 6: Comprehensive Verification & Test Suite
**Files:**
- Run: `bun run lint`
- Run: `bun test`
- Run: `bun run build`

- [ ] Confirm 0 TypeScript compilation errors.
- [ ] Confirm all 84 automated tests pass with 0 failures.
- [ ] Confirm production build succeeds.
- [ ] Confirm live server responds on http://localhost:5000/ with all portals fully functional.
