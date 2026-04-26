import { neon } from '@neondatabase/serverless';

async function wipe() {
  let dbUrl = process.env.DATABASE_URL!;
  if (dbUrl.startsWith("psql '")) {
    dbUrl = dbUrl.substring(6, dbUrl.length - 1);
  }
  const sql = neon(dbUrl);
  await sql`DROP SCHEMA public CASCADE;`;
  await sql`CREATE SCHEMA public;`;
  console.log("Wiped schema");
}
wipe();
