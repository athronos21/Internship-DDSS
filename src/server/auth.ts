import { betterAuth } from 'better-auth';
import { memoryAdapter } from 'better-auth/adapters/memory';
import path from 'path';

// Check if running in Bun runtime with native SQLite
const isBun = typeof (globalThis as any).Bun !== 'undefined';
export let authDb: any = null;

if (isBun) {
  try {
    const getRequire = (import.meta as any).require || (globalThis as any).require;
    const sqliteModule = getRequire ? getRequire('bun:sqlite') : null;
    if (sqliteModule && sqliteModule.Database) {
      const dbPath = process.env.NODE_ENV === 'test' ? ':memory:' : path.resolve(process.cwd(), 'auth.sqlite');
      authDb = new sqliteModule.Database(dbPath);

      authDb.run(`
        CREATE TABLE IF NOT EXISTS user (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          emailVerified INTEGER NOT NULL DEFAULT 0,
          image TEXT,
          createdAt DATETIME NOT NULL,
          updatedAt DATETIME NOT NULL,
          role TEXT DEFAULT 'PHARMACIST'
        );
      `);

      authDb.run(`
        CREATE TABLE IF NOT EXISTS session (
          id TEXT PRIMARY KEY,
          expiresAt DATETIME NOT NULL,
          token TEXT NOT NULL UNIQUE,
          createdAt DATETIME NOT NULL,
          updatedAt DATETIME NOT NULL,
          ipAddress TEXT,
          userAgent TEXT,
          userId TEXT NOT NULL REFERENCES user(id)
        );
      `);

      authDb.run(`
        CREATE TABLE IF NOT EXISTS account (
          id TEXT PRIMARY KEY,
          accountId TEXT NOT NULL,
          providerId TEXT NOT NULL,
          userId TEXT NOT NULL REFERENCES user(id),
          accessToken TEXT,
          refreshToken TEXT,
          idToken TEXT,
          accessTokenExpiresAt DATETIME,
          refreshTokenExpiresAt DATETIME,
          scope TEXT,
          password TEXT,
          createdAt DATETIME NOT NULL,
          updatedAt DATETIME NOT NULL
        );
      `);

      authDb.run(`
        CREATE TABLE IF NOT EXISTS verification (
          id TEXT PRIMARY KEY,
          identifier TEXT NOT NULL,
          value TEXT NOT NULL,
          expiresAt DATETIME NOT NULL,
          createdAt DATETIME,
          updatedAt DATETIME
        );
      `);
    }
  } catch {
    authDb = null;
  }
}

export const auth = betterAuth({
  database: authDb || memoryAdapter({}),
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:5000',
  secret: process.env.BETTER_AUTH_SECRET || 'kaziniya-super-secret-better-auth-key-at-least-32-chars',
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'PHARMACIST',
      },
    },
  },
});

let seedingPromise: Promise<boolean> | null = null;

/**
 * Seed initial administrative users into Better Auth if they do not exist
 */
export async function seedInitialBetterAuthUsers(): Promise<boolean> {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_DEMO_SEED !== 'true') {
    return false;
  }

  if (seedingPromise) {
    return seedingPromise;
  }

  seedingPromise = (async () => {
    const defaultUsers = [
      {
        email: 'athronos21@gmail.com',
        password: 'Password123!',
        name: 'Atronos Sisay (Super Admin)',
        role: 'SUPER_ADMIN',
      },
      {
        email: 'beka.girma@gmail.com',
        password: 'Password123!',
        name: 'Beka Girma (Super Admin)',
        role: 'SUPER_ADMIN',
      },
      {
        email: 'admin@kaziniya.et',
        password: 'Password123!',
        name: 'Kaziniya Ahmed (Drug Store Owner)',
        role: 'STORE_OWNER',
      },
      {
        email: 'kaziniya@kaziniya.com',
        password: 'Password123!',
        name: 'Kaziniya Ahmed (Drug Store Owner)',
        role: 'STORE_OWNER',
      },
      {
        email: 'admin@kaziniya.com',
        password: 'Password123!',
        name: 'Kaziniya Ahmed (Drug Store Owner)',
        role: 'STORE_OWNER',
      },
      {
        email: 'monet@kaziniya.com',
        password: 'Password123!',
        name: 'Monet Alemayehu (Pharmacist)',
        role: 'PHARMACIST',
      },
      {
        email: 'munaa7536@gmail.com',
        password: 'Password123!',
        name: 'Monet Alemayehu (Pharmacist)',
        role: 'PHARMACIST',
      },
      {
        email: 'supplier@medtech.com',
        password: 'Password123!',
        name: 'Supplier (Wholesale Supplier)',
        role: 'SUPPLIER',
      },
    ];

    for (const u of defaultUsers) {
      try {
        if (authDb) {
          const existing = authDb.query('SELECT id FROM user WHERE email = ?').get(u.email);
          if (!existing) {
            await auth.api.signUpEmail({
              body: {
                email: u.email,
                password: u.password,
                name: u.name,
                role: u.role,
              } as any,
            });
          }
          // Ensure user role matches configured default role
          authDb.run('UPDATE user SET role = ? WHERE email = ?', [u.role, u.email]);
        } else {
          await auth.api.signUpEmail({
            body: {
              email: u.email,
              password: u.password,
              name: u.name,
              role: u.role,
            } as any,
          });
        }
      } catch {
        // Ignore if user already seeded
      }
    }
    return true;
  })();

  return seedingPromise;
}

import crypto from 'crypto';

/**
 * Hash a password using scrypt with a unique random salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verify a candidate password against a stored scrypt hash or legacy plaintext
 */
export function verifyPassword(password: string, combinedHash: string): boolean {
  if (!combinedHash) return false;
  if (!combinedHash.includes(':')) {
    // Legacy plaintext support for initial transition
    return password === combinedHash;
  }
  const [salt, key] = combinedHash.split(':');
  try {
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
  } catch {
    return false;
  }
}
