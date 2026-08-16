import "server-only";

import { Pool, type PoolClient, type QueryResultRow } from "pg";

const globalForDb = globalThis as typeof globalThis & { masterEnglishPool?: Pool };

function getPool() {
  if (globalForDb.masterEnglishPool) return globalForDb.masterEnglishPool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");
  const pool = new Pool({ connectionString, max: 10, idleTimeoutMillis: 30_000 });
  globalForDb.masterEnglishPool = pool;
  return pool;
}

export async function query<T extends QueryResultRow>(text: string, values: unknown[] = []) {
  return getPool().query<T>(text, values);
}

export async function transaction<T>(run: (client: PoolClient) => Promise<T>) {
  const client = await getPool().connect();
  try {
    await client.query("begin");
    const result = await run(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
