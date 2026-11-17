import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

type Database = NodePgDatabase<Record<string, never>>;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaNextJsPostgresqlDb?: Database;
};

/** Lazily created so a missing DATABASE_URL fails inside a request, not at import time. */
function getPool(): Pool {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }
  if (!globalForDb.__arenaNextJsPostgresqlPool) {
    globalForDb.__arenaNextJsPostgresqlPool = new Pool({ connectionString: databaseUrl });
  }
  return globalForDb.__arenaNextJsPostgresqlPool;
}

export const pool = new Proxy({} as Pool, {
  get(_target, prop, receiver) {
    const instance = getPool();
    const value = Reflect.get(instance as object, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export const db: Database = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    if (!globalForDb.__arenaNextJsPostgresqlDb) {
      globalForDb.__arenaNextJsPostgresqlDb = drizzle(getPool());
    }
    const instance = globalForDb.__arenaNextJsPostgresqlDb;
    const value = Reflect.get(instance as object, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
