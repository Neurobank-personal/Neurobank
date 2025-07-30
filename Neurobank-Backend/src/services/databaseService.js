const { Pool } = require("pg");
const config = require("../config");

class DatabaseService {
  constructor() {
    if (config.dataStorageMode === "database" && config.databaseUrl) {
      this.pool = new Pool({
        connectionString: config.databaseUrl,
        ssl: {
          rejectUnauthorized: false,
        },
      });
    } else {
      this.pool = null;
    }
  }

  async query(text, params) {
    if (!this.pool) {
      throw new Error("Database not configured");
    }
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  async initializeTables() {
    if (!this.pool) return;

    // Skapa users-tabell
    await this.query(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR PRIMARY KEY,
                email VARCHAR UNIQUE NOT NULL,
                name VARCHAR,
                password VARCHAR,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

    // Skapa notes-tabell
    await this.query(`
            CREATE TABLE IF NOT EXISTS notes (
                id VARCHAR PRIMARY KEY,
                title VARCHAR,
                content TEXT,
                user_id VARCHAR,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                folder_id VARCHAR
            )
        `);

    // Lägg till user_id kolumn om den saknas
    try {
      await this.query(
        `ALTER TABLE notes ADD COLUMN IF NOT EXISTS user_id VARCHAR`
      );
    } catch (error) {
      // Kolumnen finns redan eller annat fel - ignorera
    }

    // Skapa flashcards-tabell
    await this.query(`
            CREATE TABLE IF NOT EXISTS flashcards (
                id VARCHAR PRIMARY KEY,
                deck_id VARCHAR,
                question TEXT,
                answer TEXT,
                difficulty INTEGER DEFAULT 1,
                user_id VARCHAR,
                next_review_date TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

    // Lägg till user_id kolumn om den saknas
    try {
      await this.query(
        `ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS user_id VARCHAR`
      );
    } catch (error) {
      // Kolumnen finns redan eller annat fel - ignorera
    }

    // Skapa decks-tabell
    await this.query(`
            CREATE TABLE IF NOT EXISTS decks (
                id VARCHAR PRIMARY KEY,
                name VARCHAR NOT NULL,
                description TEXT,
                user_id VARCHAR,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

    // Lägg till user_id kolumn om den saknas
    try {
      await this.query(
        `ALTER TABLE decks ADD COLUMN IF NOT EXISTS user_id VARCHAR`
      );
    } catch (error) {
      // Kolumnen finns redan eller annat fel - ignorera
    }

    // Skapa note_folders-tabell
    await this.query(`
            CREATE TABLE IF NOT EXISTS note_folders (
                id VARCHAR PRIMARY KEY,
                name VARCHAR NOT NULL,
                description TEXT,
                user_id VARCHAR,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

    // Lägg till user_id kolumn om den saknas
    try {
      await this.query(
        `ALTER TABLE note_folders ADD COLUMN IF NOT EXISTS user_id VARCHAR`
      );
    } catch (error) {
      // Kolumnen finns redan eller annat fel - ignorera
    }

    // Skapa tasks-tabell
    await this.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id VARCHAR PRIMARY KEY,
                title VARCHAR NOT NULL,
                description TEXT,
                completed BOOLEAN DEFAULT false,
                priority VARCHAR DEFAULT 'medium',
                due_date TIMESTAMP,
                user_id VARCHAR,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

    // Lägg till user_id kolumn om den saknas
    try {
      await this.query(
        `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id VARCHAR`
      );
    } catch (error) {
      // Kolumnen finns redan eller annat fel - ignorera
    }

    // Skapa user_stats-tabell
    await this.query(`
            CREATE TABLE IF NOT EXISTS user_stats (
                id VARCHAR PRIMARY KEY,
                user_id VARCHAR,
                study_sessions INTEGER DEFAULT 0,
                cards_reviewed INTEGER DEFAULT 0,
                accuracy_rate DECIMAL(5,2) DEFAULT 0,
                streak_days INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
    }
  }
}

module.exports = new DatabaseService();
