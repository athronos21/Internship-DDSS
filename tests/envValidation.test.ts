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
