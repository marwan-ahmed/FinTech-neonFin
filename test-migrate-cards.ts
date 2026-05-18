import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';

const dbUrl = "postgresql://neondb_owner:npg_Xqay3hvY7DGW@ep-wandering-water-amudnicy-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function migrate() {
  try {
    const client = postgres(dbUrl, { max: 1 });
    const db = drizzle({ client });

    console.log("Creating card_batches table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "card_batches" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
        "batch_name" text NOT NULL,
        "quantity" integer NOT NULL,
        "remaining_quantity" integer NOT NULL,
        "wholesale_price" numeric(12, 2) NOT NULL,
        "total_cost" numeric(12, 2) NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log("SUCCESS: Created card_batches table!");

    console.log("Altering loans table...");
    try {
      await db.execute(sql`
        ALTER TABLE "loans" ADD COLUMN "disbursement_type" text DEFAULT 'cash' NOT NULL;
      `);
      console.log("Added disbursement_type to loans");
    } catch (e: any) {
      console.log("disbursement_type already exists or error:", e.message);
    }

    try {
      await db.execute(sql`
        ALTER TABLE "loans" ADD COLUMN "card_batch_id" uuid REFERENCES "card_batches"("id") ON DELETE SET NULL;
      `);
      console.log("Added card_batch_id to loans");
    } catch (e: any) {
      console.log("card_batch_id already exists or error:", e.message);
    }

    try {
      await db.execute(sql`
        ALTER TABLE "loans" ADD COLUMN "cards_allocated" integer DEFAULT 0;
      `);
      console.log("Added cards_allocated to loans");
    } catch (e: any) {
      console.log("cards_allocated already exists or error:", e.message);
    }

    try {
      await db.execute(sql`
        ALTER TABLE "loans" ADD COLUMN "card_wholesale_price" numeric(12, 2);
      `);
      console.log("Added card_wholesale_price to loans");
    } catch (e: any) {
      console.log("card_wholesale_price already exists or error:", e.message);
    }

    console.log("SUCCESS: All card system schema alterations applied successfully!");
    await client.end();
  } catch (e: any) {
    console.error("FAILED to run cards migration:", e.message);
  }
  process.exit(0);
}
migrate();
