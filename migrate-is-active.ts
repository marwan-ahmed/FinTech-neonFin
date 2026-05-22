import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { db } from './lib/db';
import { sql } from 'drizzle-orm';

async function migrate() {
  try {
    await db.execute(sql`ALTER TABLE "tenants" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;`);
    console.log("Added is_active to tenants");
  } catch (e: any) {
    console.log("Fail adding is_active:", e.message);
  }

  process.exit(0);
}
migrate();
