require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL);

async function migrate() {
  try {
    await sql`ALTER TABLE "loan_schedules" ADD COLUMN IF NOT EXISTS "installment_number" integer DEFAULT 1 NOT NULL;`;
    console.log("Added installment_number");
  } catch (e) {
    console.log("Fail installment_number:", e.message);
  }
  
  try {
    await sql`ALTER TABLE "loan_schedules" ADD COLUMN IF NOT EXISTS "paid_amount" numeric(12, 2) DEFAULT '0';`;
    console.log("Added paid_amount");
  } catch (e) {
    console.log("Fail paid_amount:", e.message);
  }

  process.exit(0);
}
migrate();