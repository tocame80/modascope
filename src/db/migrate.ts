import { runMigrations } from "@kilocode/app-builder-db";
import { db } from "./index";

if (!db) {
  console.log("Database not available, skipping migrations");
} else {
  await runMigrations(db, {}, { migrationsFolder: "./src/db/migrations" });
}
