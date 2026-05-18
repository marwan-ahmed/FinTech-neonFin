import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';

async function testCustomConnection() {
  // Get database URL from command line argument or process.env.DATABASE_URL
  const dbUrl = process.argv[2] || process.env.DATABASE_URL;

  if (!dbUrl) {
    console.log("\n❌ خطأ: لم يتم توفير رابط الاتصال بقاعدة البيانات!");
    console.log("الرجاء تشغيل السكريبت وتمرير الرابط كمعامل كالتالي:");
    console.log("npx ts-node test-db-connection.ts \"رابط_اتصال_قاعدة_البيانات_هنا\"");
    console.log("\nأو قم بتعيينه كمتغير بيئي مؤقت في PowerShell:");
    console.log("$env:DATABASE_URL=\"رابط_الاتصال\"; npx ts-node test-db-connection.ts\n");
    process.exit(1);
  }

  console.log("\n🔌 جاري محاولة الاتصال بقاعدة بيانات Neon PostgreSQL...");
  const startTime = Date.now();

  try {
    let cleanUrl = dbUrl.trim();
    if (cleanUrl.startsWith("psql '")) {
      cleanUrl = cleanUrl.substring(6, cleanUrl.length - 1);
    }

    const client = postgres(cleanUrl, { max: 1, connect_timeout: 10 });
    const db = drizzle({ client });

    console.log("⚡ تم إنشاء العميل، جاري تنفيذ استعلام تجريبي...");
    const result = await db.execute(sql`SELECT 1 as connection_test`);
    const latency = Date.now() - startTime;

    console.log("\n✨ ======================================= ✨");
    console.log("🎉 SUCCESS: تم الاتصال بنجاح تام بقاعدة البيانات!");
    console.log(`⏱️ زمن الاستجابة (Latency): ${latency}ms`);
    console.log("📊 نتيجة الاستعلام التجريبي:", JSON.stringify(result));
    console.log("✨ ======================================= ✨\n");

    await client.end();
  } catch (error: any) {
    const latency = Date.now() - startTime;
    console.log("\n❌ ======================================= ❌");
    console.log("🔴 FAILED: فشل الاتصال بقاعدة البيانات!");
    console.log(`⏱️ الوقت المستغرق قبل الفشل: ${latency}ms`);
    console.log("📝 تفاصيل الخطأ:", error.message || error);
    console.log("❌ ======================================= ❌\n");
  }
  process.exit(0);
}

testCustomConnection();
