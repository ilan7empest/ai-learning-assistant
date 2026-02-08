export type Card = {
  _id: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed: Date | null;
  reviewCount: number;
  isStarred: boolean;
};

export type Flashcard = {
  _id: string;
  userId: string;
  documentId: {
    _id: string;
    title: string;
  };
  cards: Card[];
  createdAt: string;
  updatedAt: string;
};
