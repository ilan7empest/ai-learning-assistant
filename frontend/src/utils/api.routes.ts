export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    GET_PROFILE: '/auth/profile',
    UPDATE_PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  DOCUMENTS: {
    UPLOAD: '/documents/upload',
    GET_DOCUMENTS: '/documents',
    GET_DOCUMENT_BY_ID: (id: string) => `/documents/${id}`,
    DELETE_DOCUMENT: (id: string) => `/documents/${id}`,
  },
  AI: {
    GENERATE_FLASHCARDS: '/ai/generate-flashcards',
    GENERATE_QUIZ: '/ai/generate-quiz',
    GENERATE_SUMMARY: '/ai/generate-summary',
    CHAT: '/ai/chat',
    EXPLAIN_CONCEPT: '/ai/explain-concept',
    GET_CHAT_HISTORY: (documentId: string) => `/ai/chat-history/${documentId}`,
  },
  FLASHCARDS: {
    GET_ALL_FLASHCARD_SETS: '/flashcards',
    GET_FLASHCARDS_FOR_DOC: (documentId: string) => `/flashcards/${documentId}`,
    REVIEW_FLASHCARD: (cardId: string) => `/flashcards/${cardId}/review`,
    TOGGLE_STAR: (cardId: string) => `/flashcards/${cardId}/star`,
    DELETE_FLASHCARD_SET: (id: string) => `/flashcards/${id}`,
  },
  QUIZZES: {
    GET_QUIZZES_FOR_DOC: (documentId: string) => `/quizzes/${documentId}`,
    GET_QUIZ_BY_ID: (id: string) => `/quizzes/quiz/${id}`,
    SUBMIT_QUIZ: (id: string) => `/quizzes/${id}/submit`,
    GET_QUIZ_RESULTS: (id: string) => `/quizzes/${id}/results`,
    DELETE_QUIZ: (id: string) => `/quizzes/${id}`,
  },
  PROGRESS: {
    GET_DASHBOARD: '/progress/dashboard',
  },
};
