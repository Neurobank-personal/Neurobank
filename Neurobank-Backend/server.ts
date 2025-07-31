import express from "express";
import cors from "cors";
import config from "./src/config";
import {
  errorHandler,
  notFoundHandler,
} from "./src/middleware/errorHandler";

// Routes
import healthRoutes from "./src/routes/health";
import userRoutes from "./src/routes/users";
import noteRoutes from "./src/routes/notes";
import noteFolderRoutes from "./src/routes/noteFolders";
import flashcardRoutes from "./src/routes/flashcards";
import taskRoutes from "./src/routes/tasks";
import deckRoutes from "./src/routes/decks";
import statisticsRoutes from "./src/routes/statistics";

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

app.listen(config.port, () => {
  console.log(`🚀 Neurobank Backend körs på http://localhost:${config.port}`);
  console.log(`📁 Data sparas i: ${config.dataDir}`);
});