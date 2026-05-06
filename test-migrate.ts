import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from './lib/db';
import { sql } from 'drizzle-orm';

async function migrate() {
  try {
    await db.execute(sql`ALTER TABLE "loan_schedules" ADD COLUMN "installment_number" integer DEFAULT 1 NOT NULL;`);
    console.log("Added installment_number");
  } catch (e: any) {
    console.log("Fail installment_number:", e.message);
  }
  
  try {
    await db.execute(sql`ALTER TABLE "loan_schedules" ADD COLUMN "paid_amount" numeric(12, 2) DEFAULT '0';`);
    console.log("Added paid_amount");
  } catch (e: any) {
    console.log("Fail paid_amount:", e.message);
  }

  process.exit(0);
}
migrate();