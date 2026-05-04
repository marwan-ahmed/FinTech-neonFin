import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
let dbUrl = process.env.DATABASE_URL || '';
if (dbUrl.startsWith("psql '")) {
  dbUrl = dbUrl.substring(6, dbUrl.length - 1);
}

export default defineConfig({
  schema: './schema/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: dbUrl,
  },
});
