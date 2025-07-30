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
                process_type VARCHAR,
                processed_content TEXT,
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

    // Lägg till process_type kolumn om den saknas
    try {
      await this.query(
        `ALTER TABLE notes ADD COLUMN IF NOT EXISTS process_type VARCHAR`
      );
    } catch (error) {
      // Kolumnen finns redan eller annat fel - ignorera
    }

    // Lägg till processed_content kolumn om den saknas
    try {
      await this.query(
        `ALTER TABLE notes ADD COLUMN IF NOT EXISTS processed_content TEXT`
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
                categories JSONB,
                difficulty INTEGER DEFAULT 1,
                source_note_id VARCHAR,
                last_reviewed TIMESTAMP,
                next_review_date TIMESTAMP,
                review_count INTEGER DEFAULT 0,
                easy_count INTEGER DEFAULT 0,
                status VARCHAR DEFAULT 'active',
                user_id VARCHAR,
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

    // Lägg till saknade kolumner för flashcards
    try {
      await this.query(
        `ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS categories JSONB`
      );
    } catch (error) {}

    try {
      await this.query(
        `ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS source_note_id VARCHAR`
      );
    } catch (error) {}

    try {
      await this.query(
        `ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS last_reviewed TIMESTAMP`
      );
    } catch (error) {}

    try {
      await this.query(
        `ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0`
      );
    } catch (error) {}

    try {
      await this.query(
        `ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS easy_count INTEGER DEFAULT 0`
      );
    } catch (error) {}

    try {
      await this.query(
        `ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'active'`
      );
    } catch (error) {}

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
                color VARCHAR,
                note_count INTEGER DEFAULT 0,
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

    // Lägg till saknade kolumner för note_folders
    try {
      await this.query(
        `ALTER TABLE note_folders ADD COLUMN IF NOT EXISTS color VARCHAR`
      );
    } catch (error) {}

    try {
      await this.query(
        `ALTER TABLE note_folders ADD COLUMN IF NOT EXISTS note_count INTEGER DEFAULT 0`
      );
    } catch (error) {}

    // Skapa tasks-tabell
    await this.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id VARCHAR PRIMARY KEY,
                title VARCHAR NOT NULL,
                description TEXT,
                status VARCHAR DEFAULT 'pending',
                priority VARCHAR DEFAULT 'medium',
                due_date TIMESTAMP,
                completed_at TIMESTAMP,
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

    // Lägg till saknade kolumner för tasks
    try {
      await this.query(
        `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'pending'`
      );
    } catch (error) {}

    try {
      await this.query(
        `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP`
      );
    } catch (error) {}

    // Ta bort gamla completed kolumn om den finns
    try {
      await this.query(`ALTER TABLE tasks DROP COLUMN IF EXISTS completed`);
    } catch (error) {}

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
