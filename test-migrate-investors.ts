import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';

const dbUrl = "postgresql://neondb_owner:npg_Xqay3hvY7DGW@ep-wandering-water-amudnicy-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function migrate() {
  try {
    const client = postgres(dbUrl, { max: 1 });
    const db = drizzle({ client });

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "investor_distributions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
        "investor_id" uuid NOT NULL REFERENCES "investors"("id") ON DELETE CASCADE,
        "loan_id" uuid NOT NULL REFERENCES "loans"("id") ON DELETE CASCADE,
        "schedule_id" uuid NOT NULL REFERENCES "loan_schedules"("id") ON DELETE CASCADE,
        "amount" numeric(12, 2) NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log("SUCCESS: Created investor_distributions table!");
    await client.end();
  } catch (e: any) {
    console.error("FAILED to create investor_distributions table:", e.message);
  }
  process.exit(0);
}
migrate();
