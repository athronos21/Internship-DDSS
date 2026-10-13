# Phase 2C: Database Persistence & Secret Fail-Fast Design Specification

**Status:** Approved  
**Author:** Antigravity  
**Date:** 2026-10-12  
**Target Milestone:** Phase 2C (PostgreSQL Persistence, Environment Validation, and Production Credential Lockdown)  

---

## 1. Problem Statement & Audit Context

The updated security audit identified critical P0 vulnerabilities in application persistence and production configuration:

1. **PostgreSQL Configured but Not the Source of Truth (P0)**:
   - The application relies on in-memory arrays in `src/server/db.ts` for medicines, batches, sales, inventory adjustments, and audit logs.
   - Better Auth in `src/server/auth.ts` uses Bun SQLite or falls back to an in-memory adapter.
   - On serverless hosting (e.g. Vercel) or containerized restarts, state is wiped or partitioned across instances.
2. **Default Credentials and Secret Fallbacks (P0)**:
   - `src/server/auth.ts` contains a hardcoded fallback secret (`'kaziniya-super-secret-better-auth-key-at-least-32-chars'`).
   - `src/server/auth.ts` automatically seeds administrative accounts (`athronos21@gmail.com`, `admin@kaziniya.et`, etc.) with a shared known password (`Password123!`).
   - If deployed to production, these defaults grant administrative access to unauthorized third parties.

---

## 2. Core Architectural Principles

1. **Production Fail-Fast**: The application refuses to start in `production` mode if required persistence (`DATABASE_URL`) or cryptographic secrets (`BETTER_AUTH_SECRET`) are missing, invalid, or using development fallback defaults.
2. **Persistent PostgreSQL Source of Truth**: When `DATABASE_URL` is configured, Better Auth and database operations use a managed `pg.Pool` connection pool with automatic schema verification (`docker/init.sql`).
3. **Zero Production Demo Credentials**: `seedInitialBetterAuthUsers()` is completely disabled when `NODE_ENV === 'production'`. Default shared passwords never enter a production database.
4. **Controlled Administrative Bootstrapping**: Production administrators are provisioned strictly via dedicated environment variables (`INITIAL_ADMIN_EMAIL`, `INITIAL_ADMIN_PASSWORD`) or a secure CLI script (`scripts/create-admin.ts`).
5. **Deterministic Test Execution**: In `test` and local development without a running Docker container, the application allows in-memory/SQLite execution with explicit warnings, ensuring fast and isolated CI test runs.

---

## 3. Detailed Component Design

### 3.1 Production Environment Validation (`src/server/config.ts`)

A dedicated configuration validator checks environment variables before server initialization:

```typescript
export interface EnvironmentConfig {
  nodeEnv: string;
  databaseUrl?: string;
  betterAuthSecret: string;
  betterAuthUrl: string;
  port: number;
}

export const FALLBACK_DEV_SECRET = 'kaziniya-super-secret-better-auth-key-at-least-32-chars';

export function validateEnvironment(): EnvironmentConfig {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProd = nodeEnv === 'production';
  const databaseUrl = process.env.DATABASE_URL;
  const betterAuthSecret = process.env.BETTER_AUTH_SECRET;

  if (isProd) {
    if (!databaseUrl || !databaseUrl.trim()) {
      throw new Error(
        'FATAL: DATABASE_URL is required in production mode. Refusing to start in-memory mode.'
      );
    }

    if (!betterAuthSecret || !betterAuthSecret.trim()) {
      throw new Error(
        'FATAL: BETTER_AUTH_SECRET is required in production mode.'
      );
    }

    if (betterAuthSecret === FALLBACK_DEV_SECRET) {
      throw new Error(
        'FATAL: BETTER_AUTH_SECRET cannot use the development fallback secret in production mode.'
      );
    }

    if (betterAuthSecret.length < 32) {
      throw new Error(
        'FATAL: BETTER_AUTH_SECRET must be at least 32 characters long in production mode.'
      );
    }
  }

  return {
    nodeEnv,
    databaseUrl,
    betterAuthSecret: betterAuthSecret || FALLBACK_DEV_SECRET,
    betterAuthUrl: process.env.BETTER_AUTH_URL || 'http://localhost:5000',
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  };
}
```

### 3.2 PostgreSQL Connection Pool & Schema Runner (`src/server/db/postgres.ts`)

- Uses `pg.Pool` from the `pg` package.
- Manages connection lifecycle with connection pooling (`max: 20`, `idleTimeoutMillis: 30000`).
- Provides `checkDatabaseConnection()` health check verifying database responsiveness.
- Provides `runSchemaMigrations()` to apply tables and indexes from `docker/init.sql` if tables do not exist.

### 3.3 Better Auth PostgreSQL Integration (`src/server/auth.ts`)

- When `process.env.DATABASE_URL` is set:
  - Better Auth initializes with `pg.Pool`.
- When in `test` or local mode without `DATABASE_URL`:
  - Better Auth initializes with `bun:sqlite` (in-memory or SQLite file).
- Secret configuration uses validated `config.betterAuthSecret`.

### 3.4 Production Credential Lockdown (`src/server/auth.ts`)

`seedInitialBetterAuthUsers()` is hardened:
```typescript
export async function seedInitialBetterAuthUsers() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_DEMO_SEED !== 'true') {
    // In production, refuse to seed shared-password demo accounts
    return;
  }
  // ... seed in development/test only
}
```

### 3.5 Initial Production Administrator Script (`scripts/create-admin.ts`)

A standalone CLI script allowing pharmacy operators to create an initial store owner account securely on first deployment:
```bash
bun scripts/create-admin.ts --email admin@example.com --name "Store Owner" --password "SecurePass123!"
```

---

## 4. File Changes & Interface Modifications

| File | Change |
| :--- | :--- |
| `package.json` | Add `pg` and `@types/pg` dependencies. |
| `src/server/config.ts` | New environment validation module with production fail-fast rules. |
| `src/server/db/postgres.ts` | New PostgreSQL pool and schema migration runner. |
| `src/server/auth.ts` | Connect Better Auth to `pg.Pool` when `DATABASE_URL` exists; enforce validated secret; disable default demo user seeding in production. |
| `server.ts` | Call `validateEnvironment()` at server startup. |
| `scripts/create-admin.ts` | Secure administrative account creation script for production onboarding. |
| `tests/envValidation.test.ts` | New test suite verifying fail-fast environment checks and production seed lockdown. |

---

## 5. Security & Verification Acceptance Criteria

1. **Production Missing `DATABASE_URL` Rejection**: Server startup throws fatal error when `NODE_ENV=production` and `DATABASE_URL` is absent.
2. **Production Missing/Default `BETTER_AUTH_SECRET` Rejection**: Server startup throws fatal error when `NODE_ENV=production` and `BETTER_AUTH_SECRET` is unset, $< 32$ chars, or equals the dev fallback.
3. **Production Demo User Lockdown**: `seedInitialBetterAuthUsers()` does not create `Password123!` accounts when `NODE_ENV=production`.
4. **PostgreSQL Pool & Schema Verification**: `pg.Pool` successfully initializes with connection pooling parameters.
5. **Full Regression Guarantee**: All 225 existing tests pass in `test` mode.
