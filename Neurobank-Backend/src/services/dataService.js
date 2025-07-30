const fileService = require("./fileService");
const databaseService = require("./databaseService");
const config = require("../config");

class DataService {
  constructor() {
    this.useDatabase =
      config.dataStorageMode === "database" && config.databaseUrl;
  }

  // Users
  async getUsers() {
    if (this.useDatabase) {
      const result = await databaseService.query(
        "SELECT * FROM users ORDER BY created_at DESC"
      );
      return result.rows.map((row) => ({
        id: row.id,
        email: row.email,
        name: row.name,
        password: row.password,
        createdAt: row.created_at?.toISOString(),
        updatedAt: row.updated_at?.toISOString(),
      }));
    } else {
      return fileService.readUsers();
    }
  }

  async saveUsers(users) {
    if (this.useDatabase) {
      // För batch insert använder vi transaction
      const client = await databaseService.pool.connect();
      try {
        await client.query("BEGIN");
        await client.query("DELETE FROM users"); // Rensa först

        for (const user of users) {
          await client.query(
            "INSERT INTO users (id, email, name, password, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)",
            [
              user.id,
              user.email,
              user.name,
              user.password,
              user.createdAt,
              user.updatedAt,
            ]
          );
        }

        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } else {
      return fileService.writeUsers(users);
    }
  }

  async createUser(user) {
    if (this.useDatabase) {
      const result = await databaseService.query(
        "INSERT INTO users (id, email, name, password, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [
          user.id,
          user.email,
          user.name,
          user.password,
          user.createdAt,
          user.updatedAt,
        ]
      );
      const row = result.rows[0];
      return {
        id: row.id,
        email: row.email,
        name: row.name,
        password: row.password,
        createdAt: row.created_at?.toISOString(),
        updatedAt: row.updated_at?.toISOString(),
      };
    } else {
      const users = await this.getUsers();
      users.push(user);
      await this.saveUsers(users);
      return user;
    }
  }

  async updateUser(userId, updates) {
    if (this.useDatabase) {
      const result = await databaseService.query(
        "UPDATE users SET email = $2, name = $3, password = $4, updated_at = $5 WHERE id = $1 RETURNING *",
        [
          userId,
          updates.email,
          updates.name,
          updates.password,
          updates.updatedAt,
        ]
      );
      if (result.rows.length === 0) {
        throw new Error("Användare hittades inte");
      }
      const row = result.rows[0];
      return {
        id: row.id,
        email: row.email,
        name: row.name,
        password: row.password,
        createdAt: row.created_at?.toISOString(),
        updatedAt: row.updated_at?.toISOString(),
      };
    } else {
      const users = await this.getUsers();
      const userIndex = users.findIndex((user) => user.id === userId);
      if (userIndex === -1) {
        throw new Error("Användare hittades inte");
      }
      users[userIndex] = { ...users[userIndex], ...updates };
      await this.saveUsers(users);
      return users[userIndex];
    }
  }

  async deleteUser(userId) {
    if (this.useDatabase) {
      const result = await databaseService.query(
        "DELETE FROM users WHERE id = $1",
        [userId]
      );
      if (result.rowCount === 0) {
        throw new Error("Användare hittades inte");
      }
      return true;
    } else {
      const users = await this.getUsers();
      const filteredUsers = users.filter((user) => user.id !== userId);
      if (users.length === filteredUsers.length) {
        throw new Error("Användare hittades inte");
      }
      await this.saveUsers(filteredUsers);
      return true;
    }
  }

  // Notes
  async getNotes() {
    if (this.useDatabase) {
      const result = await databaseService.query(
        "SELECT * FROM notes ORDER BY created_at DESC"
      );
      return result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        content: row.content,
        userId: row.user_id,
        folderId: row.folder_id,
        createdAt: row.created_at?.toISOString(),
        updatedAt: row.updated_at?.toISOString(),
      }));
    } else {
      return fileService.readNotes();
    }
  }

  async saveNotes(notes) {
    if (this.useDatabase) {
      const client = await databaseService.pool.connect();
      try {
        await client.query("BEGIN");
        await client.query("DELETE FROM notes");

        for (const note of notes) {
          await client.query(
            "INSERT INTO notes (id, title, content, user_id, folder_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [
              note.id,
              note.title,
              note.content,
              note.userId,
              note.folderId,
              note.createdAt,
              note.updatedAt,
            ]
          );
        }

        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } else {
      return fileService.writeNotes(notes);
    }
  }

  // Flashcards
  async getFlashcards() {
    if (this.useDatabase) {
      const result = await databaseService.query(
        "SELECT * FROM flashcards ORDER BY created_at DESC"
      );
      return result.rows.map((row) => ({
        id: row.id,
        deckId: row.deck_id,
        question: row.question,
        answer: row.answer,
        difficulty: row.difficulty,
        nextReviewDate: row.next_review_date?.toISOString(),
        createdAt: row.created_at?.toISOString(),
        updatedAt: row.updated_at?.toISOString(),
      }));
    } else {
      return fileService.readFlashcards();
    }
  }

  async saveFlashcards(flashcards) {
    if (this.useDatabase) {
      const client = await databaseService.pool.connect();
      try {
        await client.query("BEGIN");
        await client.query("DELETE FROM flashcards");

        for (const card of flashcards) {
          await client.query(
            "INSERT INTO flashcards (id, deck_id, question, answer, difficulty, next_review_date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
            [
              card.id,
              card.deckId,
              card.question,
              card.answer,
              card.difficulty,
              card.nextReviewDate,
              card.createdAt,
              card.updatedAt,
            ]
          );
        }

        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } else {
      return fileService.writeFlashcards(flashcards);
    }
  }

  // Decks
  async getDecks() {
    if (this.useDatabase) {
      const result = await databaseService.query(
        "SELECT * FROM decks ORDER BY created_at DESC"
      );
      return result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        createdAt: row.created_at?.toISOString(),
        updatedAt: row.updated_at?.toISOString(),
      }));
    } else {
      return fileService.readDecks();
    }
  }

  async saveDecks(decks) {
    if (this.useDatabase) {
      const client = await databaseService.pool.connect();
      try {
        await client.query("BEGIN");
        await client.query("DELETE FROM decks");

        for (const deck of decks) {
          await client.query(
            "INSERT INTO decks (id, name, description, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)",
            [
              deck.id,
              deck.name,
              deck.description,
              deck.createdAt,
              deck.updatedAt,
            ]
          );
        }

        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } else {
      return fileService.writeDecks(decks);
    }
  }

  // Note Folders
  async getNoteFolders() {
    if (this.useDatabase) {
      const result = await databaseService.query(
        "SELECT * FROM note_folders ORDER BY created_at DESC"
      );
      return result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        createdAt: row.created_at?.toISOString(),
        updatedAt: row.updated_at?.toISOString(),
      }));
    } else {
      return fileService.readNoteFolders();
    }
  }

  async saveNoteFolders(folders) {
    if (this.useDatabase) {
      const client = await databaseService.pool.connect();
      try {
        await client.query("BEGIN");
        await client.query("DELETE FROM note_folders");

        for (const folder of folders) {
          await client.query(
            "INSERT INTO note_folders (id, name, description, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)",
            [
              folder.id,
              folder.name,
              folder.description,
              folder.createdAt,
              folder.updatedAt,
            ]
          );
        }

        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } else {
      return fileService.writeNoteFolders(folders);
    }
  }

  // Tasks
  async getTasks() {
    if (this.useDatabase) {
      const result = await databaseService.query(
        "SELECT * FROM tasks ORDER BY created_at DESC"
      );
      return result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        completed: row.completed,
        priority: row.priority,
        dueDate: row.due_date?.toISOString(),
        createdAt: row.created_at?.toISOString(),
        updatedAt: row.updated_at?.toISOString(),
      }));
    } else {
      return fileService.readTasks();
    }
  }

  async saveTasks(tasks) {
    if (this.useDatabase) {
      const client = await databaseService.pool.connect();
      try {
        await client.query("BEGIN");
        await client.query("DELETE FROM tasks");

        for (const task of tasks) {
          await client.query(
            "INSERT INTO tasks (id, title, description, completed, priority, due_date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
            [
              task.id,
              task.title,
              task.description,
              task.completed,
              task.priority,
              task.dueDate,
              task.createdAt,
              task.updatedAt,
            ]
          );
        }

        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } else {
      return fileService.writeTasks(tasks);
    }
  }

  // User Stats
  async getUserStats() {
    if (this.useDatabase) {
      const result = await databaseService.query(
        "SELECT * FROM user_stats ORDER BY created_at DESC"
      );
      return result.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        studySessions: row.study_sessions,
        cardsReviewed: row.cards_reviewed,
        accuracyRate: parseFloat(row.accuracy_rate),
        streakDays: row.streak_days,
        createdAt: row.created_at?.toISOString(),
        updatedAt: row.updated_at?.toISOString(),
      }));
    } else {
      return fileService.readUserStats();
    }
  }

  async saveUserStats(stats) {
    if (this.useDatabase) {
      const client = await databaseService.pool.connect();
      try {
        await client.query("BEGIN");
        await client.query("DELETE FROM user_stats");

        for (const stat of stats) {
          await client.query(
            "INSERT INTO user_stats (id, user_id, study_sessions, cards_reviewed, accuracy_rate, streak_days, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
            [
              stat.id,
              stat.userId,
              stat.studySessions,
              stat.cardsReviewed,
              stat.accuracyRate,
              stat.streakDays,
              stat.createdAt,
              stat.updatedAt,
            ]
          );
        }

        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } else {
      return fileService.writeUserStats(stats);
    }
  }

  async initializeDatabase() {
    if (this.useDatabase) {
      await databaseService.initializeTables();
    }
  }
}

module.exports = new DataService();
