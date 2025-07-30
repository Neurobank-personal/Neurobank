const express = require("express");
const cors = require("cors");
const config = require("./src/config");
const {
  errorHandler,
  notFoundHandler,
} = require("./src/middleware/errorHandler");

// Services
const dataService = require("./src/services/dataService");

// Routes
const healthRoutes = require("./src/routes/health");
const userRoutes = require("./src/routes/users");
const noteRoutes = require("./src/routes/notes");
const noteFolderRoutes = require("./src/routes/noteFolders");
const flashcardRoutes = require("./src/routes/flashcards");
const taskRoutes = require("./src/routes/tasks");
const deckRoutes = require("./src/routes/decks");
const statisticsRoutes = require("./src/routes/statistics");

const app = express();

// CORS setup - tillåt requests från frontend
app.use(
  cors({
    origin: [
      config.frontendUrl, // din localhost/nuvarande
      "https://neurobank-frontend.vercel.app", // Vercel URL
    ],
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/health", healthRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/note-folders", noteFolderRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/decks", deckRoutes);
app.use("/api/statistics", statisticsRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database tables on startup
async function initializeApp() {
  try {
    if (config.dataStorageMode === "database") {
      console.log("🗄️  Initialiserar databastabeller...");
      await dataService.initializeDatabase();
      console.log("✅ Databastabeller initialiserade");
    }
  } catch (error) {
    console.error("❌ Fel vid databasinitialisering:", error);
    if (config.dataStorageMode === "database") {
      console.log("🔄 Faller tillbaka till JSON-filhantering");
    }
  }
}

app.listen(config.port, async () => {
  console.log(`🚀 Neurobank Backend körs på http://localhost:${config.port}`);
  console.log(
    `📁 Datalagring: ${
      config.dataStorageMode === "database"
        ? "Supabase Database"
        : `JSON-filer i ${config.dataDir}`
    }`
  );
  console.log(
    `🤖 OpenAI API Key: ${config.openaiApiKey ? "✅ Laddad" : "❌ Saknas"}`
  );
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`📱 Frontend URL: ${config.frontendUrl}`);

  // Initialize database
  await initializeApp();
});
