import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let dbInitialized = false;

async function getDb() {
  if (dbInitialized) return db;
  
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.warn("DATABASE_URL not configured");
    dbInitialized = true;
    return null;
  }
  
  try {
    const sql = neon(connectionString);
    db = drizzle(sql, { schema });
    dbInitialized = true;
  } catch (error) {
    console.warn("Database not available:", error);
    dbInitialized = true;
  }
  
  return db;
}

export { getDb, schema };
