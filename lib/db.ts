import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../schema/schema';

function getInitializedDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be defined');
  }

  let dbUrl = process.env.DATABASE_URL!;
  if (dbUrl.startsWith("psql '")) {
    dbUrl = dbUrl.substring(6, dbUrl.length - 1);
  }

  // create a postgres client. We specify max connectors in case it's not a pooled instance
  const client = postgres(dbUrl, { max: 10 });
  return drizzle({ client, schema });
}

// Lazy initialization proxy to prevent Next.js eval-time errors during build or app startup
// when DATABASE_URL is not yet configured.
let cachedDb: ReturnType<typeof getInitializedDb> | null = null;

export const db = new Proxy({} as ReturnType<typeof getInitializedDb>, {
  get(target, prop) {
    if (!cachedDb) {
      cachedDb = getInitializedDb();
    }
    const value = (cachedDb as any)[prop];
    if (typeof value === 'function') {
      return value.bind(cachedDb);
    }
    return value;
  },
});
