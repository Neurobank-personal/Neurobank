require("dotenv").config();

const config = {
  port: process.env.PORT || 3001,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  nodeEnv: process.env.NODE_ENV || "development",
  openaiApiKey: process.env.OPENAI_API_KEY,

  // Databas och lagring
  databaseUrl: process.env.DATABASE_URL,
  dataStorageMode: process.env.DATA_STORAGE_MODE || "file",
  dataDir: "data",
  usersFile: "users.json",
  notesFile: "notes.json",

  // AI-inställningar
  ai: {
    model: "gpt-3.5-turbo",
    maxTokens: 4000,
    temperature: 0.7,
  },
};

module.exports = config;
