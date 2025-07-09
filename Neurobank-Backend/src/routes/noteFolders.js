const express = require("express");
const router = express.Router();
const noteFolderService = require("../services/noteFolderService");

// Get all note folders for a user
router.get("/user/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const folders = await noteFolderService.getUserNoteFolders(userId);
    res.json(folders);
  } catch (error) {
    next(error);
  }
});

// Get a specific note folder
router.get("/:folderId", async (req, res, next) => {
  try {
    const { folderId } = req.params;
    const folder = await noteFolderService.getNoteFolder(folderId);

    if (!folder) {
      return res.status(404).json({ error: "Note folder not found" });
    }

    res.json(folder);
  } catch (error) {
    next(error);
  }
});

// Create a new note folder
router.post("/", async (req, res, next) => {
  try {
    const folderData = req.body;
    const newFolder = await noteFolderService.createNoteFolder(folderData);
    res.status(201).json(newFolder);
  } catch (error) {
    next(error);
  }
});

// Update a note folder
router.put("/:folderId", async (req, res, next) => {
  try {
    const { folderId } = req.params;
    const updates = req.body;

    const updatedFolder = await noteFolderService.updateNoteFolder(
      folderId,
      updates
    );

    if (!updatedFolder) {
      return res.status(404).json({ error: "Note folder not found" });
    }

    res.json(updatedFolder);
  } catch (error) {
    next(error);
  }
});

// Delete a note folder
router.delete("/:folderId", async (req, res, next) => {
  try {
    const { folderId } = req.params;
    await noteFolderService.deleteNoteFolder(folderId);
    res.json({ message: "Note folder deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// Get all notes in a specific folder
router.get("/:folderId/notes", async (req, res, next) => {
  try {
    const { folderId } = req.params;
    const notes = await noteFolderService.getNoteFolderNotes(folderId);
    res.json(notes);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
