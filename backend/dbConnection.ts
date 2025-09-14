import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

/**
 * @type {Promise<Database>}
 */
export const dbPromise = open({
  filename: "./gazintech.sqlite",
  driver: sqlite3.Database,
});

/**
 * @returns {Promise<void>}
 */
export const initializeDatabase = async () => {
  const db = await dbPromise;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS nivel (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nivel TEXT NOT NULL,
      number_of_developers INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS desenvolvedor (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      sexo TEXT NOT NULL,
      data_nascimento TEXT NOT NULL,
      idade INTEGER NOT NULL,
      hobby TEXT NOT NULL,
      nivel_id INTEGER,
      FOREIGN KEY (nivel_id) REFERENCES nivel(id)
    );
  `);
  console.log("Database tables initialized successfully.");
};

/**
 * @returns {Promise<boolean>}
 */
export const isDatabaseConnected = async () => {
  try {
    const db = await dbPromise;
    await db.get("SELECT 1");
    return true;
  } catch (error) {
    console.error("Database connection error:", error);
    return false;
  }
};
