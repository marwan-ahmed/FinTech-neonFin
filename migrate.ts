import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }
  
  let dbUrl = process.env.DATABASE_URL;
  if (dbUrl.startsWith("psql '")) {
    dbUrl = dbUrl.substring(6, dbUrl.length - 1);
  }
  
  console.log('Running migrations...');
  const migrationClient = postgres(dbUrl, { max: 1 });
  const db = drizzle(migrationClient);
  
  // Before applying drop, we need to map old statuses to new status enum
  // We'll run a raw SQL query if the columns still exist.
  try {
    console.log('Migrating old boolean statuses to new enum...');
    await migrationClient`
      UPDATE "tenants" 
      SET "status" = CASE 
        WHEN "is_approved" = FALSE THEN 'pending'::tenant_status
        WHEN "is_approved" = TRUE AND "is_active" = FALSE THEN 'frozen'::tenant_status
        WHEN "is_approved" = TRUE AND "is_active" = TRUE THEN 'active'::tenant_status
      END
      WHERE "is_approved" IS NOT NULL AND "is_active" IS NOT NULL;
    `;
    console.log('Successfully mapped old data to new status field.');
  } catch(e) {
    console.log('Skipping data mapping (columns might already be dropped).');
  }

  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migrations complete!');
  
  await migrationClient.end();
}

runMigration().catch((err) => {
  console.error(err);
  process.exit(1);
});
