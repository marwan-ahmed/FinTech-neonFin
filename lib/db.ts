import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../schema/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be defined');
}

let dbUrl = process.env.DATABASE_URL!;
if (dbUrl.startsWith("psql '")) {
  dbUrl = dbUrl.substring(6, dbUrl.length - 1);
}

// create a postgres client. We specify max connectors in case it's not a pooled instance
const client = postgres(dbUrl, { max: 10 });
export const db = drizzle({ client, schema });
