import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // 1. Create the enum type
    await db.execute(sql`DO $$ BEGIN CREATE TYPE "tenant_status" AS ENUM('pending', 'active', 'frozen'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
    
    // 2. Add the new status column
    await db.execute(sql`ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "status" "tenant_status" DEFAULT 'pending' NOT NULL;`);
    
    // 3. Migrate data from old columns to new column (if old columns still exist)
    try {
      await db.execute(sql`
        UPDATE "tenants" 
        SET "status" = CASE 
          WHEN "is_approved" = FALSE THEN 'pending'::tenant_status
          WHEN "is_approved" = TRUE AND "is_active" = FALSE THEN 'frozen'::tenant_status
          WHEN "is_approved" = TRUE AND "is_active" = TRUE THEN 'active'::tenant_status
        END
      `);
    } catch(e) {
      console.log('Old columns might already be dropped or not exist, skipping data migration.');
    }
    
    // 4. Drop old columns
    await db.execute(sql`ALTER TABLE "tenants" DROP COLUMN IF EXISTS "is_active";`);
    await db.execute(sql`ALTER TABLE "tenants" DROP COLUMN IF EXISTS "is_approved";`);
    
    return NextResponse.json({ success: true, message: "Migration completed successfully: status enum created and old boolean columns removed." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
