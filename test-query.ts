import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';

async function testQuery() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("No DATABASE_URL in env");
    process.exit(1);
  }
  try {
    const client = postgres(dbUrl, { max: 1 });
    const db = drizzle({ client });
    
    const allUsers = await db.execute(sql`SELECT * FROM "users";`);
    const allTenants = await db.execute(sql`SELECT * FROM "tenants";`);
    
    console.log("=== TENANTS ===");
    console.log(allTenants);
    console.log("=== USERS ===");
    console.log(allUsers);
    
    await client.end();
  } catch (error: any) {
    console.error("Query Error:", error.message);
  }
  process.exit(0);
}
testQuery();