import { Pool } from 'pg';
import type { AppConfig } from './config.js';

let pool: Pool | null = null;

export function createDb(config: AppConfig) {
  pool = new Pool({
    connectionString: config.databaseUrl,
  });
  console.log('Database connection created');
}

export function query(query: string, values?: unknown[]) {
  if (pool === null) {
    throw new Error('Database not initialized');
  }
  return pool.query(query, values);
}

export function pingDb() {
  return query('SELECT 1 AS one');
}

export async function closeDb() {
  if (pool === null) {
    return;
  }

  await pool.end();
  pool = null;
  console.log('Database connection closed');
}
