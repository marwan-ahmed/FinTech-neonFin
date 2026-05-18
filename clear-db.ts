import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';

async function clearDb() {
  // Try loading DATABASE_URL from process.env (could be set via command-line)
  const dbUrl = process.argv[2] || process.env.DATABASE_URL;

  if (!dbUrl) {
    console.error("\n❌ خطأ: لم يتم توفير رابط الاتصال بقاعدة البيانات!");
    console.log("الرجاء تشغيل السكريبت وتمرير الرابط كمعامل كالتالي:");
    console.log("npx ts-node clear-db.ts \"رابط_اتصال_قاعدة_البيانات_هنا\"\n");
    process.exit(1);
  }

  let cleanUrl = dbUrl.trim();
  if (cleanUrl.startsWith("psql '")) {
    cleanUrl = cleanUrl.substring(6, cleanUrl.length - 1);
  }

  console.log("\n🧹 جاري تصفير قاعدة بيانات Neon PostgreSQL بالكامل مع الحفاظ على الهيكل...");
  
  try {
    const client = postgres(cleanUrl, { max: 1 });
    const db = drizzle({ client });

    // Truncate tables with CASCADE to handle foreign key dependencies gracefully
    await db.execute(sql`
      TRUNCATE TABLE 
        "investor_distributions",
        "audit_logs",
        "loan_schedules",
        "loans",
        "card_batches",
        "investors",
        "users",
        "tenants",
        "kyc_applications"
      CASCADE;
    `);

    console.log("\n✨ ======================================= ✨");
    console.log("🎉 SUCCESS: تم تصفير قاعدة البيانات بنجاح تام!");
    console.log("📂 جميع الجداول فارغة وجاهزة لاستقبال البيانات الحقيقية.");
    console.log("✨ ======================================= ✨\n");

    await client.end();
  } catch (error: any) {
    console.log("\n❌ ======================================= ❌");
    console.log("🔴 FAILED: فشل تصفير قاعدة البيانات!");
    console.log("📝 تفاصيل الخطأ:", error.message || error);
    console.log("❌ ======================================= ❌\n");
  }
  process.exit(0);
}

clearDb();
