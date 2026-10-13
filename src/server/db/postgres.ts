import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

let poolInstance: pg.Pool | null = null;
let currentDbUrl: string | undefined = undefined;

export function getPostgresPool(): pg.Pool | null {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl || !databaseUrl.trim()) {
    if (poolInstance) {
      poolInstance.end().catch(() => {});
      poolInstance = null;
      currentDbUrl = undefined;
    }
    return null;
  }

  if (poolInstance && currentDbUrl === databaseUrl) {
    return poolInstance;
  }

  if (poolInstance) {
    poolInstance.end().catch(() => {});
  }

  currentDbUrl = databaseUrl;
  poolInstance = new Pool({
    connectionString: databaseUrl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  poolInstance.on('error', (err) => {
    console.error('[PostgreSQL Pool Unexpected Error]', err);
  });

  return poolInstance;
}

export async function checkDatabaseConnection(): Promise<{ connected: boolean; latencyMs?: number; error?: string }> {
  const pool = getPostgresPool();
  if (!pool) {
    return { connected: false, error: 'DATABASE_URL is not configured' };
  }

  const start = Date.now();
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      return { connected: true, latencyMs: Date.now() - start };
    } finally {
      client.release();
    }
  } catch (err: any) {
    return { connected: false, error: err.message };
  }
}

export async function runSchemaMigrations(): Promise<boolean> {
  const pool = getPostgresPool();
  if (!pool) return false;

  const initSqlPath = path.resolve(process.cwd(), 'docker', 'init.sql');
  if (!fs.existsSync(initSqlPath)) {
    console.warn(`[Migrations] Schema file not found at ${initSqlPath}`);
    return false;
  }

  const sql = fs.readFileSync(initSqlPath, 'utf-8');
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log('✅ PostgreSQL schema verified and up-to-date.');
    return true;
  } catch (err: any) {
    console.error('❌ Failed to apply PostgreSQL schema:', err);
    throw err;
  } finally {
    client.release();
  }
}
