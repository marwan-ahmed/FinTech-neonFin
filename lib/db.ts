import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../schema/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be defined');
}

let dbUrl = process.env.DATABASE_URL!;
if (dbUrl.startsWith("psql '")) {
  dbUrl = dbUrl.substring(6, dbUrl.length - 1);
}

const sql = neon(dbUrl);
export const db = drizzle(sql, { schema });
