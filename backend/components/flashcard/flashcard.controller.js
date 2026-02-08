import Flashcard from './flashcard.model.js';

const flashcardController = {
  getAllFlashcardSets: async (req, res, next) => {
    try {
      const flashcardSets = await Flashcard.find({ userId: req.user._id })
        .populate('documentId', 'title')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: flashcardSets,
        count: flashcardSets.length,
      });
    } catch (error) {
      next(error);
    }
  },
  getFlashcards: async (req, res, next) => {
    try {
      const flashcards = await Flashcard.find({
        userId: req.user._id,
        documentId: req.params.documentId,
      })
        .populate('documentId', 'title fileName')
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, data: flashcards, count: flashcards.length });
    } catch (error) {
      next(error);
    }
  },
  reviewFlashcard: async (req, res, next) => {
    try {
      const flashcardSet = await Flashcard.findOne({
        'cards._id': req.params.cardId,
        userId: req.user._id,
      });

      if (!flashcardSet) {
        return res.status(404).json({
          success: false,
          error: 'Flashcard set or card not found',
          statusCode: 404,
        });
      }

      const cardIndex = flashcardSet.cards.findIndex((card) => card._id.toString() === req.params.cardId);

      if (cardIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Card not found in the flashcard set',
          statusCode: 404,
        });
      }

      // Update review data
      flashcardSet.cards[cardIndex].lastReviewed = new Date();
      flashcardSet.cards[cardIndex].reviewCount += 1;

      await flashcardSet.save();

      res.status(200).json({
        success: true,
        data: flashcardSet,
        message: 'Flashcard reviewed successfully',
      });
    } catch (error) {
      next(error);
    }
  },
  toggleStarFlashcard: async (req, res, next) => {
    try {
      const flashcardSet = await Flashcard.findOne({
        'cards._id': req.params.cardId,
        userId: req.user._id,
      });

      if (!flashcardSet) {
        return res.status(404).json({
          success: false,
          error: 'Flashcard set or card not found',
          statusCode: 404,
        });
      }

      const cardIndex = flashcardSet.cards.findIndex((card) => card._id.toString() === req.params.cardId);

      if (cardIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Card not found in the flashcard set',
          statusCode: 404,
        });
      }

      // Toggle isStarred field
      flashcardSet.cards[cardIndex].isStarred = !flashcardSet.cards[cardIndex].isStarred;

      await flashcardSet.save();

      res.status(200).json({
        success: true,
        data: flashcardSet,
        message: `Flashcard ${flashcardSet.cards[cardIndex].isStarred ? 'starred' : 'unstarred'} successfully`,
      });
    } catch (error) {
      next(error);
    }
  },
  deleteFlashcardSet: async (req, res, next) => {
    try {
      const flashcardSet = await Flashcard.findOneAndDelete({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (!flashcardSet) {
        return res.status(404).json({
          success: false,
          error: 'Flashcard set not found',
          statusCode: 404,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Flashcard set deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};

export const getAllFlashcardSets = flashcardController.getAllFlashcardSets;
export const getFlashcards = flashcardController.getFlashcards;
export const reviewFlashcard = flashcardController.reviewFlashcard;
export const toggleStarFlashcard = flashcardController.toggleStarFlashcard;
export const deleteFlashcardSet = flashcardController.deleteFlashcardSet;
