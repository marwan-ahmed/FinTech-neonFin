import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from './lib/db';
import { sql } from 'drizzle-orm';
import { loanSchedules } from './schema/schema';

async function testQuery() {
  try {
    const res = await db.select().from(loanSchedules).limit(1);
    console.log("Query Result:", res);
  } catch (error: any) {
    console.error("Query Error:", error.message);
  }
  process.exit(0);
}
testQuery();