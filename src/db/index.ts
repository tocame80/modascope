import { createDatabase } from "@kilocode/app-builder-db";
import * as schema from "./schema";

let db: ReturnType<typeof createDatabase> | null = null;

try {
  db = createDatabase(schema);
} catch (error) {
  console.warn("Database not available:", error);
}

export { db };
