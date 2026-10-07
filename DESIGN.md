# Kaziniya Design System & Visual Guidelines

## Visual Language: Clinical Precision
The interface conveys clinical reliability, regulatory authority, and swift counter readability. It avoids decorative AI clichés (e.g. purple-to-blue neon gradients, nested cards, bouncy animations) in favor of crisp typography, clean data density, and distinct status badges.

## Color Palette
- **Primary Brand**: Deep Emerald & Medical Teal
  - Brand Main: `#0f766e` (`teal-700`) / `#047857` (`emerald-700`)
  - Accent / Focus: `#0d9488` (`teal-600`) / `#059669` (`emerald-600`)
  - Background Neutral: `#f8fafc` (`slate-50`) to `#ffffff`
- **Clinical Status Badges**:
  - Valid / Active / In-Stock: Deep Emerald ink on mint background (`text-emerald-900 bg-emerald-100 border-emerald-300`)
  - Expiry Warning (<90 days): Dark amber ink on warm amber ground (`text-amber-950 bg-amber-100 border-amber-300`)
  - Expired / Stockout / Critical: Deep crimson ink on rose ground (`text-rose-950 bg-rose-100 border-rose-300`)
  - Cold-Chain Biologicals: Glacier cyan ink on blue-slate ground (`text-sky-950 bg-sky-100 border-sky-300`)

## Deterministic Anti-Pattern Enforcement (Impeccable Standards)
1. **No Gray Text on Colored Backgrounds**:
   - ❌ Bad: `text-slate-900 bg-emerald-400`
   - ✅ Good: `text-emerald-950 bg-emerald-400` or `text-white bg-emerald-600`
2. **No Bounce/Elastic Easing**:
   - ❌ Bad: `animate-bounce`
   - ✅ Good: Smooth exponential easing (`ease-out`, `cubic-bezier(0.16, 1, 0.3, 1)`)
3. **No Decorative Border Accents on Rounded Cards**:
   - ❌ Bad: `rounded-2xl border-t-2 border-emerald-500`
   - ✅ Good: Uniform clean border (`border border-slate-200`) with semantic indicator badge inside.
4. **No Purple AI Neon Gradients**:
   - Pure medical clinical colors only (Teal, Emerald, Slate, Medical Blue).

## Typography
- Primary: Clean modern sans-serif with tabular numbers (`font-mono` for batch numbers, prices, and EFDA IDs).
- Scale: Strict typographic hierarchy with generous line heights for scanability.
