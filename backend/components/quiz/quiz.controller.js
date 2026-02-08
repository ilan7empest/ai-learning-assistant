import Quiz from './quiz.model.js';

const quizController = {
  // @desc    Get all quizzes for a document
  // @route   GET /api/quizzes/:documentId
  // @access  Private
  getQuizzes: async (req, res, next) => {
    try {
      const quizzes = await Quiz.find({
        userId: req.user._id,
        documentId: req.params.documentId,
      })
        .populate('documentId', 'title fileName')
        .sort({ createdAt: -1 });

      res
        .status(200)
        .json({ success: true, data: quizzes, count: quizzes.length });
    } catch (error) {
      next(error);
    }
  },

  // @desc    Get a single quiz by ID
  // @route   GET /api/quizzes/quiz/:id
  // @access  Private
  getQuizById: async (req, res, next) => {
    try {
      const quiz = await Quiz.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (!quiz) {
        return res
          .status(404)
          .json({ success: false, error: 'Quiz not found', statusCode: 404 });
      }

      res.status(200).json({ success: true, data: quiz });
    } catch (error) {
      next(error);
    }
  },

  // @desc    Submit answers for a quiz
  // @route   POST /api/quizzes/:id/submit
  // @access  Private
  submitQuiz: async (req, res, next) => {
    try {
      const { answers } = req.body;

      if (!Array.isArray(answers)) {
        return res.status(400).json({
          success: false,
          error: 'Answers must be an array',
          statusCode: 400,
        });
      }

      const quiz = await Quiz.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (!quiz) {
        return res
          .status(404)
          .json({ success: false, error: 'Quiz not found', statusCode: 404 });
      }

      if (quiz.completedAt) {
        return res.status(400).json({
          success: false,
          error: 'Quiz has already been submitted',
          statusCode: 400,
        });
      }

      // Proccess answers and calculate score (implementation omitted)
      let correctCount = 0;
      const userAnswers = [];

      answers.forEach((answer) => {
        const { questionIndex, selectedAnswer } = answer;

        if (questionIndex < quiz.questions.length) {
          const question = quiz.questions[questionIndex];
          const isCorrect = question.correctAnswer === selectedAnswer;

          if (isCorrect) correctCount++;

          userAnswers.push({
            questionIndex,
            selectedAnswer,
            isCorrect,
            answeredAt: new Date(),
          });
        }
      });

      // Calculate score
      const score = Math.round((correctCount / quiz.totalQuestions) * 100);

      quiz.userAnswers = userAnswers;
      quiz.score = score;
      quiz.completedAt = new Date();

      await quiz.save();

      res.status(200).json({
        success: true,
        data: {
          quizId: quiz._id,
          score,
          correctCount,
          totalQuestions: quiz.totalQuestions,
          percentage: score,
          userAnswers,
        },
        message: 'Quiz submitted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
  // @desc    Get quiz results
  // @route   GET /api/quizzes/:id/results
  // @access  Private
  getQuizResults: async (req, res, next) => {
    try {
      const quiz = await Quiz.findOne({
        _id: req.params.id,
        userId: req.user._id,
      }).populate('documentId', 'title');

      if (!quiz) {
        return res
          .status(404)
          .json({ success: false, error: 'Quiz not found', statusCode: 404 });
      }

      if (!quiz.completedAt) {
        return res.status(400).json({
          success: false,
          error: 'Quiz has not been submitted yet',
          statusCode: 400,
        });
      }

      // Build detailed results
      const detailedResults = quiz.questions.map((question, index) => {
        const userAnswer = quiz.userAnswers.find(
          (ua) => ua.questionIndex === index,
        );

        return {
          questionIndex: index,
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          selectedAnswer: userAnswer.selectedAnswer || null,
          explanation: question.explanation,
          isCorrect: userAnswer.isCorrect || false,
        };
      });

      res.status(200).json({
        success: true,
        data: {
          quiz: {
            id: quiz._id,
            title: quiz.title,
            document: quiz.documentId,
            score: quiz.score,
            totalQuestions: quiz.totalQuestions,
            completedAt: quiz.completedAt,
          },
          results: detailedResults,
        },
        message: 'Quiz results fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  },
  // @desc    Delete a quiz
  // @route   DELETE /api/quizzes/:id
  // @access  Private
  deleteQuiz: async (req, res, next) => {
    try {
      const quiz = await Quiz.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (!quiz) {
        return res
          .status(404)
          .json({ success: false, error: 'Quiz not found', statusCode: 404 });
      }

      await quiz.deleteOne();

      res.status(200).json({
        success: true,
        message: 'Quiz deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};

export const getQuizzes = quizController.getQuizzes;
export const getQuizById = quizController.getQuizById;
export const submitQuiz = quizController.submitQuiz;
export const getQuizResults = quizController.getQuizResults;
export const deleteQuiz = quizController.deleteQuiz;
