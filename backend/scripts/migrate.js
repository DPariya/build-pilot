import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import pool from "../src/config/db.js";
import { logError } from "../src/utils/logger.js";

const migrate = async () => {
  const client = await pool.connect();
  try {
    console.log("Running migrations...");
    // 1. Create tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `);
    // 2. Get list of already executed migrations
    const result = await client.query("SELECT filename FROM migrations");
    const executedMigrations = result.rows.map((row) => row.filename);

    // 3. Read all .sql files from migrations folder
    const migrationDir = path.join(__dirname, "../migrations");
    const files = fs
      .readdirSync(migrationDir)
      .filter((file) => file.endsWith(".sql"));

    // 4. Run each migration that hasn't been executed yet
    for (const file of files) {
      if (executedMigrations.includes(file)) {
        console.log(`Skipping (already ran): ${file}`);
        continue;
      }
      const filePath = path.join(migrationDir, file);
      const sql = fs.readFileSync(filePath, "utf-8");

      console.log(`Executing migration: ${file}`);
      await client.query(sql);
      // 5. Record that this migration has been executed
      await client.query("INSERT INTO migrations (filename) VALUES ($1)", [
        file,
      ]);
    }
    console.log("Migrations completed successfully");
  } catch (error) {
    // console.error("Migration failed:", error);
    logError("Migration", error);
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();
