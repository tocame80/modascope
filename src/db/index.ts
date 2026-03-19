import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let dbInitialized = false;

async function getDb() {
  if (dbInitialized) return db;
  
  const connectionString = process.env.DATABASE_URL || process.env.DB_URL || process.env.POSTGRES_URL;
  console.log("DATABASE_URL present:", !!connectionString);
  console.log("DATABASE_URL starts with:", connectionString?.substring(0, 30));
  
  if (!connectionString) {
    console.warn("DATABASE_URL not configured - env vars:", Object.keys(process.env).filter(k => k.includes('DB') || k.includes('POSTGRES')));
    dbInitialized = true;
    return null;
  }
  
  try {
    const sql = neon(connectionString);
    db = drizzle(sql, { schema });
    dbInitialized = true;
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
    dbInitialized = true;
  }
  
  return db;
}

export { getDb, schema };
