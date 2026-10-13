# Phase 2C: Database Persistence & Secret Fail-Fast Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement production fail-fast environment validation, PostgreSQL connection pooling with auto-schema verification, production demo account seeding lockdown, and a secure CLI for initial administrator creation.

**Architecture:** Add `validateEnvironment()` in `src/server/config.ts` to abort startup in production if `DATABASE_URL` or a strong `BETTER_AUTH_SECRET` are missing; add `src/server/db/postgres.ts` to manage `pg.Pool` and apply `docker/init.sql`; update `auth.ts` to connect to PostgreSQL when `DATABASE_URL` is provided and disable demo password seeding in production.

**Tech Stack:** Express.js, TypeScript, PostgreSQL (`pg`), Better Auth, Bun runtime.

**Spec:** [`docs/superpowers/specs/2026-10-12-phase2c-db-persistence-failfast-design.md`](file:///C:/Users/Nythor/Desktop/ISP2026/Internship-DDSS/docs/superpowers/specs/2026-10-12-phase2c-db-persistence-failfast-design.md)

## Global Constraints

- Never start the server in `production` mode if `DATABASE_URL` is missing or empty.
- Never start the server in `production` mode if `BETTER_AUTH_SECRET` is missing, shorter than 32 characters, or equal to the development fallback string.
- Never seed default demo accounts (`Password123!`) when `NODE_ENV === 'production'`.
- Preserve in-memory / SQLite fallback during local unit testing (`NODE_ENV === 'test'`) so all tests run fast without mandatory external Docker dependencies.
- Maintain clean TypeScript compilation (`tsc --noEmit`) and 100% test pass across the test suite.

## Review Focus

1. `validateEnvironment()` throws when `NODE_ENV=production` and `DATABASE_URL` is undefined.
2. `validateEnvironment()` throws when `NODE_ENV=production` and `BETTER_AUTH_SECRET` equals `FALLBACK_DEV_SECRET`.
3. `validateEnvironment()` throws when `NODE_ENV=production` and `BETTER_AUTH_SECRET` is less than 32 characters.
4. `seedInitialBetterAuthUsers()` does not create demo accounts when `NODE_ENV=production`.
5. `src/server/db/postgres.ts` creates and configures `pg.Pool` correctly when `DATABASE_URL` is provided.

---

### Task 1: Production Environment Validation & Fail-Fast Secret Enforcement

**Files:**
- Create: `src/server/config.ts`
- Modify: `server.ts:5-65`
- Test: `tests/envValidation.test.ts`

**Interfaces:**
- Produces: `validateEnvironment()`, `FALLBACK_DEV_SECRET`, `EnvironmentConfig`

- [ ] **Step 1: Write failing tests in `tests/envValidation.test.ts`**

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { validateEnvironment, FALLBACK_DEV_SECRET } from '../src/server/config';

describe('Production Environment Validation & Secret Fail-Fast', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('allows development and test modes to run with fallback secret and without DATABASE_URL', () => {
    process.env.NODE_ENV = 'test';
    delete process.env.DATABASE_URL;
    delete process.env.BETTER_AUTH_SECRET;

    const config = validateEnvironment();
    expect(config.nodeEnv).toBe('test');
    expect(config.betterAuthSecret).toBe(FALLBACK_DEV_SECRET);
    expect(config.databaseUrl).toBeUndefined();
  });

  it('throws fatal error in production when DATABASE_URL is missing', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.DATABASE_URL;
    process.env.BETTER_AUTH_SECRET = 'a-very-strong-production-secret-with-at-least-32-characters';

    expect(() => validateEnvironment()).toThrow(
      'FATAL: DATABASE_URL is required in production mode. Refusing to start in-memory mode.'
    );
  });

  it('throws fatal error in production when BETTER_AUTH_SECRET is missing', () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/kaziniya_db';
    delete process.env.BETTER_AUTH_SECRET;

    expect(() => validateEnvironment()).toThrow(
      'FATAL: BETTER_AUTH_SECRET is required in production mode.'
    );
  });

  it('throws fatal error in production when BETTER_AUTH_SECRET uses development fallback key', () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/kaziniya_db';
    process.env.BETTER_AUTH_SECRET = FALLBACK_DEV_SECRET;

    expect(() => validateEnvironment()).toThrow(
      'FATAL: BETTER_AUTH_SECRET cannot use the development fallback secret in production mode.'
    );
  });

  it('throws fatal error in production when BETTER_AUTH_SECRET is under 32 characters', () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/kaziniya_db';
    process.env.BETTER_AUTH_SECRET = 'short-secret';

    expect(() => validateEnvironment()).toThrow(
      'FATAL: BETTER_AUTH_SECRET must be at least 32 characters long in production mode.'
    );
  });

  it('successfully validates when production environment provides strong credentials', () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/kaziniya_db';
    process.env.BETTER_AUTH_SECRET = 'super-strong-production-random-secret-key-64-characters-long!';

    const config = validateEnvironment();
    expect(config.nodeEnv).toBe('production');
    expect(config.databaseUrl).toBe('postgresql://postgres:postgres@localhost:5432/kaziniya_db');
    expect(config.betterAuthSecret).toBe('super-strong-production-random-secret-key-64-characters-long!');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test tests/envValidation.test.ts`  
Expected: FAIL because `src/server/config.ts` does not exist yet.

- [ ] **Step 3: Implement `src/server/config.ts` & invoke in `server.ts`**

Implement:
- Create `src/server/config.ts` with `validateEnvironment()` function implementing all production constraints.
- In `server.ts`, import `validateEnvironment` and invoke it in `startServer()`.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test tests/envValidation.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/config.ts server.ts tests/envValidation.test.ts
git commit -m "feat(security): enforce production fail-fast environment validation for DATABASE_URL and secrets"
```

---

### Task 2: Production Demo Credential Lockdown & Secure Admin CLI

**Files:**
- Modify: `src/server/auth.ts:95-150`
- Create: `scripts/create-admin.ts`
- Test: `tests/productionAuthSecurity.test.ts`

**Interfaces:**
- Consumes: `seedInitialBetterAuthUsers` from `src/server/auth.ts`, `validateEnvironment` from `src/server/config.ts`
- Produces: Guarded `seedInitialBetterAuthUsers()` refusing demo accounts in production and standalone `scripts/create-admin.ts`

- [ ] **Step 1: Write failing tests in `tests/productionAuthSecurity.test.ts`**

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { seedInitialBetterAuthUsers, authDb, auth } from '../src/server/auth';
import { db } from '../src/server/db';

describe('Production Authentication & Credential Lockdown', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('refuses to seed demo users when NODE_ENV is production', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.ALLOW_PRODUCTION_DEMO_SEED;

    // Track user count before
    const initialUsersCount = db.users.length;

    await seedInitialBetterAuthUsers();

    // Verify no new users were seeded
    expect(db.users.length).toBe(initialUsersCount);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test tests/productionAuthSecurity.test.ts`  
Expected: FAIL if `seedInitialBetterAuthUsers()` does not check `NODE_ENV === 'production'`.

- [ ] **Step 3: Update `src/server/auth.ts` and create `scripts/create-admin.ts`**

Implement:
- In `src/server/auth.ts`: At the top of `seedInitialBetterAuthUsers()`, check:
  ```typescript
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_DEMO_SEED !== 'true') {
    return;
  }
  ```
- Create `scripts/create-admin.ts`: A CLI script that accepts `--email`, `--name`, and `--password` flags, validates password length $\ge 8$, hashes the password, and inserts into the database.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test tests/productionAuthSecurity.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/auth.ts scripts/create-admin.ts tests/productionAuthSecurity.test.ts
git commit -m "feat(auth): disable demo credential seeding in production and provide secure admin creation CLI"
```

---

### Task 3: PostgreSQL Connection Pool & Schema Verification

**Files:**
- Modify: `package.json`
- Create: `src/server/db/postgres.ts`
- Modify: `src/server/auth.ts:1-94`
- Test: `tests/postgresIntegration.test.ts`

**Interfaces:**
- Produces: `getPostgresPool()`, `checkDatabaseConnection()`, `runSchemaMigrations()`

- [ ] **Step 1: Install `pg` and `@types/pg`**

Run: `bun add pg && bun add -d @types/pg`

- [ ] **Step 2: Write tests in `tests/postgresIntegration.test.ts`**

```typescript
import { describe, it, expect } from 'bun:test';
import { getPostgresPool } from '../src/server/db/postgres';

describe('PostgreSQL Connection Pool & Lifecycle', () => {
  it('returns null or disabled pool when DATABASE_URL is not set', () => {
    const originalUrl = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;

    const pool = getPostgresPool();
    expect(pool).toBeNull();

    if (originalUrl) process.env.DATABASE_URL = originalUrl;
  });

  it('creates and configures pg.Pool instance when DATABASE_URL is set', () => {
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/kaziniya_db';
    const pool = getPostgresPool();
    expect(pool).toBeDefined();
    expect(typeof pool?.query).toBe('function');
  });
});
```

- [ ] **Step 3: Implement `src/server/db/postgres.ts` and integrate with Better Auth**

Implement:
- `src/server/db/postgres.ts`: Exports `getPostgresPool()`, `checkDatabaseConnection()`, `runSchemaMigrations()`.
- `src/server/auth.ts`: When `process.env.DATABASE_URL` is set, Better Auth uses `pg.Pool`.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test tests/postgresIntegration.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json bun.lock* src/server/db/postgres.ts src/server/auth.ts tests/postgresIntegration.test.ts
git commit -m "feat(db): implement PostgreSQL connection pooling and Better Auth database adapter"
```

---

### Task 4: Full Regression Verification & Production Build

**Files:**
- Test: All tests across `tests/`

- [ ] **Step 1: Execute full test suite**

Run: `bun test`  
Expected: 100% pass across all test files.

- [ ] **Step 2: Execute TypeScript compilation check**

Run: `bun x tsc --noEmit`  
Expected: 0 errors.

- [ ] **Step 3: Execute production build**

Run: `bun run build`  
Expected: Client and server bundles build cleanly with exit code 0.

- [ ] **Step 4: Commit**

```bash
git add tests/ docs/superpowers/plans/ .superpowers/
git commit -m "chore(security): verify full Phase 2C database persistence & fail-fast regression suite and production build"
```
