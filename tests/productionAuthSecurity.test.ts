import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { seedInitialBetterAuthUsers } from '../src/server/auth';

describe('Production Authentication & Credential Lockdown', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('refuses to seed demo users when NODE_ENV is production and returns false', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.ALLOW_PRODUCTION_DEMO_SEED;

    const seeded = await seedInitialBetterAuthUsers();
    expect(seeded).toBe(false);
  });

  it('allows seeding when ALLOW_PRODUCTION_DEMO_SEED is explicitly true in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ALLOW_PRODUCTION_DEMO_SEED = 'true';

    const seeded = await seedInitialBetterAuthUsers();
    expect(seeded).toBe(true);
  });

  it('allows seeding in development or test environments and returns true', async () => {
    process.env.NODE_ENV = 'test';
    delete process.env.ALLOW_PRODUCTION_DEMO_SEED;

    const seeded = await seedInitialBetterAuthUsers();
    expect(seeded).toBe(true);
  });
});
