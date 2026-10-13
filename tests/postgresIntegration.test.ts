import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { getPostgresPool, checkDatabaseConnection, runSchemaMigrations } from '../src/server/db/postgres';

describe('PostgreSQL Connection Pool & Lifecycle', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns null when DATABASE_URL is not set', () => {
    delete process.env.DATABASE_URL;

    const pool = getPostgresPool();
    expect(pool).toBeNull();
  });

  it('creates and configures pg.Pool instance when DATABASE_URL is set', () => {
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/kaziniya_db';
    const pool = getPostgresPool();
    expect(pool).toBeDefined();
    expect(typeof pool?.query).toBe('function');
  });

  it('reports failure when checkDatabaseConnection is called without DATABASE_URL', async () => {
    delete process.env.DATABASE_URL;
    const status = await checkDatabaseConnection();
    expect(status.connected).toBe(false);
    expect(status.error).toContain('DATABASE_URL is not configured');
  });

  it('returns false when runSchemaMigrations is called without DATABASE_URL', async () => {
    delete process.env.DATABASE_URL;
    const result = await runSchemaMigrations();
    expect(result).toBe(false);
  });

  it('connects to live Docker PostgreSQL and runs migrations cleanly when active', async () => {
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/kaziniya_db';
    const status = await checkDatabaseConnection();
    if (!status.connected) return;

    expect(status.connected).toBe(true);
    expect(status.latencyMs).toBeGreaterThanOrEqual(0);

    const migrated = await runSchemaMigrations();
    expect(migrated).toBe(true);
  });
});
