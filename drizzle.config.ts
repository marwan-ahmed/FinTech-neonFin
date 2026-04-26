import { defineConfig } from 'drizzle-kit';

let dbUrl = process.env.DATABASE_URL!;
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
