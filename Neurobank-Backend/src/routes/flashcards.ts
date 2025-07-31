import { Router, Request, Response, NextFunction } from 'express'
import flashcardService from '../services/flashcardService'
import { Flashcard } from '../types/Flashcard'

const router = Router()

interface CreateFlashcardRequest {
  question: string;
  answer: string;
  categories?: string[];
  userId: string;
  deckId?: string;
}

interface ReviewFlashcardRequest {
  difficulty: 'easy' | 'medium' | 'hard';
}

interface CustomReviewRequest {
  days: number;
  timeUnit: 'days' | 'months';
}

// Skapa ny flashcard
router.post('/', async (req: Request<{}, Flashcard | {error: string}, CreateFlashcardRequest>, res: Response<Flashcard | {error: string}>, next: NextFunction) => {
  try {
    const { question, answer, categories, userId, deckId } = req.body as CreateFlashcardRequest;

    if (!question || !answer || !userId) {
      return res.status(400).json({
        error: 'Question, answer, and userId are required',
      });
    }

    const newFlashcard = await flashcardService.createFlashcard(
      {
        question,
        answer,
        categories: categories || [],
        deckId,
      },
      userId
    );

    res.status(201).json(newFlashcard);
  } catch (error) {
    next(error);
  }
});

// Hämta användarens flashcards
router.get('/user/:userId', async (req: Request<{userId: string}>, res: Response<Flashcard[]>, next: NextFunction) => {
  try {
    const userFlashcards = await flashcardService.getUserFlashcards(
      req.params.userId
    );
    res.json(userFlashcards);
  } catch (error) {
    next(error);
  }
});

// Hämta specifik flashcard
router.get('/:flashcardId', async (req: Request<{flashcardId: string}>, res: Response<Flashcard | {error: string}>, next: NextFunction) => {
  try {
    const flashcard = await flashcardService.getFlashcardById(
      req.params.flashcardId
    );
    if (!flashcard) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }
    res.json(flashcard);
  } catch (error) {
    next(error);
  }
});

// Uppdatera flashcard
router.put('/:flashcardId', async (req: Request<{flashcardId: string}, Flashcard, Partial<Flashcard>>, res: Response<Flashcard>, next: NextFunction) => {
  try {
    const updatedFlashcard = await flashcardService.updateFlashcard(
      req.params.flashcardId,
      req.body as Partial<Flashcard>
    );
    res.json(updatedFlashcard);
  } catch (error) {
    next(error);
  }
});

// Markera flashcard som granskad
router.patch('/:flashcardId/review', async (req: Request<{flashcardId: string}, Flashcard | {error: string}, ReviewFlashcardRequest>, res: Response<Flashcard | {error: string}>, next: NextFunction) => {
  try {
    const { difficulty } = req.body as ReviewFlashcardRequest;

    if (!difficulty || !['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({
        error: 'Valid difficulty (easy, medium, hard) is required',
      });
    }

    const updatedFlashcard = await flashcardService.markCardReviewed(
      req.params.flashcardId,
      difficulty
    );
    res.json(updatedFlashcard);
  } catch (error) {
    next(error);
  }
});

// Markera flashcard med custom review datum
router.patch('/:flashcardId/custom-review', async (req: Request<{flashcardId: string}, Flashcard | {error: string}, CustomReviewRequest>, res: Response<Flashcard | {error: string}>, next: NextFunction) => {
  try {
    const { days, timeUnit } = req.body as CustomReviewRequest;

    if (!days || !timeUnit || days < 1 || days > 30) {
      return res.status(400).json({
        error:
          'Days must be between 1-30 and timeUnit (days/months) are required',
      });
    }

    if (!['days', 'months'].includes(timeUnit)) {
      return res.status(400).json({
        error: "TimeUnit must be 'days' or 'months'",
      });
    }

    const updatedFlashcard = await flashcardService.markCardCustomReview(
      req.params.flashcardId,
      days,
      timeUnit
    );
    res.json(updatedFlashcard);
  } catch (error) {
    next(error);
  }
});

// Flytta expired cards tillbaka till remaining
router.post('/user/:userId/refresh-reviews', async (req: Request<{userId: string}>, res: Response<{success: boolean; movedCount: number; message: string}>, next: NextFunction) => {
  try {
    const movedCount = await flashcardService.moveExpiredCardsToRemaining(
      req.params.userId
    );
    res.json({
      success: true,
      movedCount,
      message: `${movedCount} cards moved back to remaining for review`,
    });
  } catch (error) {
    next(error);
  }
});

// Flytta kort manuellt tillbaka till remaining
router.patch('/:flashcardId/reset-to-remaining', async (req: Request<{flashcardId: string}>, res: Response<Flashcard>, next: NextFunction) => {
  try {
    const updatedFlashcard = await flashcardService.resetCardToRemaining(
      req.params.flashcardId
    );
    res.json(updatedFlashcard);
  } catch (error) {
    next(error);
  }
});

// Ta bort flashcard
router.delete('/:flashcardId', async (req: Request<{flashcardId: string}>, res: Response<{success: boolean}>, next: NextFunction) => {
  try {
    await flashcardService.deleteFlashcard(req.params.flashcardId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router
