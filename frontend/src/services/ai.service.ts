import httpAPI from '../utils/http';
import { API_ROUTES } from '../utils/api.routes';

const generateFlashcards = async (documentId: string, options?: { numQuestions?: number }) => {
  try {
    const response = await httpAPI.post(API_ROUTES.AI.GENERATE_FLASHCARDS, { documentId, ...options });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Generating flashcards failed' };
  }
};

const generateQuiz = async (documentId: string, options?: { numQuestions?: number; title?: string }) => {
  try {
    const response = await httpAPI.post(API_ROUTES.AI.GENERATE_QUIZ, { documentId, ...options });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Generating quiz failed' };
  }
};

const generateSummary = async (documentId: string) => {
  try {
    const { data } = await httpAPI.post(API_ROUTES.AI.GENERATE_SUMMARY, { documentId });
    return data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Generating summary failed' };
  }
};

const chat = async (documentId: string, message: string) => {
  try {
    const response = await httpAPI.post(API_ROUTES.AI.CHAT, { documentId, message });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Chatting with AI failed' };
  }
};

const explainConcept = async (documentId: string, concept: string) => {
  try {
    const { data } = await httpAPI.post(API_ROUTES.AI.EXPLAIN_CONCEPT, { documentId, concept });
    return data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Explaining concept failed' };
  }
};

const getChatHistory = async (documentId: string) => {
  try {
    const response = await httpAPI.get(API_ROUTES.AI.GET_CHAT_HISTORY(documentId));
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Fetching chat history failed' };
  }
};

export const aiService = {
  generateFlashcards,
  generateQuiz,
  generateSummary,
  chat,
  explainConcept,
  getChatHistory,
};
