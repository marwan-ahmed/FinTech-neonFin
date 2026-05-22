import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from './lib/db';
import { sql } from 'drizzle-orm';

async function runMigration() {
  console.log('Starting migration for subscriptions and approvals...');

  try {
    await db.execute(sql`ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "is_approved" BOOLEAN DEFAULT FALSE NOT NULL;`);
    await db.execute(sql`ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "subscription_status" TEXT DEFAULT 'trial' NOT NULL;`);
    await db.execute(sql`ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "subscription_end_date" TIMESTAMP;`);
    await db.execute(sql`UPDATE "tenants" SET "is_approved" = TRUE WHERE "is_approved" = FALSE;`);

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
  process.exit(0);
}

runMigration();
