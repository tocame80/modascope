import { getDb } from "./index";

const db = await getDb();
if (!db) {
  console.log("Database not available, skipping migrations");
} else {
  const { runMigrations } = await import("@kilocode/app-builder-db");
  await runMigrations(db, {}, { migrationsFolder: "./src/db/migrations" });
}
