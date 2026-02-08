export type UserAnswers = {
  questionIndex: number;
  question: string;
  options: string[];
  correctAnswer: string;
  selectedAnswer: string;
  explanation: string;
  isCorrect: boolean;
};

export type Quiz = {
  _id: string;
  userId: string;
  documentId: string;
  title: string;
  description: string;
  questions: Array<{
    _id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
  userAnswers: Array<UserAnswers>;
  score: number;
  totalQuestions: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type QuizResult = {
  quiz: {
    id: string;
    title: string;
    document: {
      _id: string;
      title: string;
    };
    score: number;
    totalQuestions: number;
    completedAt: string;
  };
  results: UserAnswers[];
};
