import { Router, Request, Response, NextFunction } from 'express'
import noteFolderService from '../services/noteFolderService'
import { NoteFolder, CreateNoteFolderRequest, UpdateNoteFolderRequest } from '../types/NoteFolder'
import { Note } from '../types/Note'

const router = Router()

// Get all note folders for a user
router.get('/user/:userId', async (req: Request<{userId: string}>, res: Response<NoteFolder[]>, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const folders = await noteFolderService.getUserNoteFolders(userId);
    res.json(folders);
  } catch (error) {
    next(error);
  }
});

// Get a specific note folder
router.get('/:folderId', async (req: Request<{folderId: string}>, res: Response<NoteFolder | {error: string}>, next: NextFunction) => {
  try {
    const { folderId } = req.params;
    const folder = await noteFolderService.getNoteFolder(folderId);

    if (!folder) {
      return res.status(404).json({ error: 'Note folder not found' });
    }

    res.json(folder);
  } catch (error) {
    next(error);
  }
});

// Create a new note folder
router.post('/', async (req: Request<{}, NoteFolder, CreateNoteFolderRequest>, res: Response<NoteFolder>, next: NextFunction) => {
  try {
    const folderData = req.body as CreateNoteFolderRequest;
    const newFolder = await noteFolderService.createNoteFolder(folderData);
    res.status(201).json(newFolder);
  } catch (error) {
    next(error);
  }
});

// Update a note folder
router.put('/:folderId', async (req: Request<{folderId: string}, NoteFolder | {error: string}, Partial<NoteFolder>>, res: Response<NoteFolder | {error: string}>, next: NextFunction) => {
  try {
    const { folderId } = req.params;
    const updates = req.body as Partial<NoteFolder>;

    const updatedFolder = await noteFolderService.updateNoteFolder(
      folderId,
      updates
    );

    if (!updatedFolder) {
      return res.status(404).json({ error: 'Note folder not found' });
    }

    res.json(updatedFolder);
  } catch (error) {
    next(error);
  }
});

// Delete a note folder
router.delete('/:folderId', async (req: Request<{folderId: string}>, res: Response<{message: string}>, next: NextFunction) => {
  try {
    const { folderId } = req.params;
    await noteFolderService.deleteNoteFolder(folderId);
    res.json({ message: 'Note folder deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get all notes in a specific folder
router.get('/:folderId/notes', async (req: Request<{folderId: string}>, res: Response<Note[]>, next: NextFunction) => {
  try {
    const { folderId } = req.params;
    const notes = await noteFolderService.getNoteFolderNotes(folderId);
    res.json(notes);
  } catch (error) {
    next(error);
  }
});

export default router
