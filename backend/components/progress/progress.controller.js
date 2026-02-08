import Document from '../document/document.model.js';
import Flashcard from '../flashcard/flashcard.model.js';
import Quiz from '../quiz/quiz.model.js';

// @desc    Get user learning statistics for dashboard
// @route   GET /api/progress/dashboard
// @access  Private
export const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get total counts
    const totalDocuments = await Document.countDocuments({ userId });
    const totalFlashcardSets = await Flashcard.countDocuments({ userId });
    const totalQuizzes = await Quiz.countDocuments({ userId });
    const completedQuizzes = await Quiz.countDocuments({
      userId,
      completedAt: { $ne: null },
    });

    // Get flashcard statistics
    const flashcardsSets = await Flashcard.find({ userId });
    let totalFlashcards = 0,
      reviewedFlashcards = 0,
      starredFlashcards = 0;

    flashcardsSets.forEach((set) => {
      totalFlashcards += set.cards.length;
      reviewedFlashcards += set.cards.filter(
        (card) => card.reviewCount > 0,
      ).length;
      starredFlashcards += set.cards.filter((card) => card.isStarred).length;
    });

    // Get quiz statistics
    const quizzes = await Quiz.find({ userId, completedAt: { $ne: null } });
    const averageScore =
      quizzes.length > 0
        ? Math.round(
            quizzes.reduce((acc, quiz) => acc + quiz.score, 0) / quizzes.length,
          )
        : 0;

    // Recent activity
    const recentDocuments = await Document.find({ userId })
      .sort({ lastAccessed: -1 })
      .limit(5)
      .select('title fileName lastAccessed status');

    const recentQuizzes = await Quiz.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('documentId', 'title')
      .select('title score totalQuestions completedAt');

    // Study streak (simplified version - in production track daily activity)
    const studyStreak = Math.floor(Math.random() * 7) + 1; // Placeholder for actual streak calculation

    res.status(200).json({
      sucess: true,
      data: {
        overview: {
          totalDocuments,
          totalFlashcardSets,
          totalFlashcards,
          reviewedFlashcards,
          starredFlashcards,
          totalQuizzes,
          completedQuizzes,
          averageScore,
          studyStreak,
        },
        recentActivity: {
          documents: recentDocuments,
          quizzes: recentQuizzes,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
