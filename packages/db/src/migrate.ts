// src/migrate.ts - Clean migration script
import "dotenv/config";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./db.js";

async function runMigrations() {
  console.log("🚀 Starting database migrations...\n");

  try {
    // Test connection first
    console.log("📡 Testing database connection...");
    await db.execute(sql`SELECT 1 as test`);
    console.log("✅ Database connection successful\n");

    // Run migrations
    console.log("📦 Running migrations from ./drizzle folder...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("✅ Migrations completed successfully!\n");

    // Verify tables exist
    console.log("🔍 Verifying migrated tables...");
    const tablesResult = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (tablesResult.length > 0) {
      tablesResult.forEach((row: Record<string, unknown>) => {
        console.log(`  ✅ ${row.table_name}`);
      });
    } else {
      console.log(
        "ℹ️  No tables found (this might be expected for a fresh database)"
      );
    }

    console.log("\n🎉 Migration process completed successfully!");
  } catch (error) {
    console.error("\n❌ Migration failed:");
    console.error(error);

    if (error instanceof Error) {
      console.log("\n💡 Common solutions:");
      if (error.message.includes("42P01")) {
        console.log(
          "- The table doesn't exist. Make sure your schema is defined correctly."
        );
      }
      if (error.message.includes("permission")) {
        console.log("- Check database user permissions.");
      }
      if (error.message.includes("connection")) {
        console.log("- Verify your DATABASE_URL and SSL configuration.");
      }
    }

    process.exit(1);
  } finally {
    // Clean up connection
    await pool.end();
    console.log("🔌 Database connection closed");
    process.exit(0);
  }
}

runMigrations();
