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
