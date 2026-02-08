import httpAPI from '../utils/http';
import { API_ROUTES } from '../utils/api.routes';
import type { Flashcard } from '../types/flashcard.type';

const getAllFlashcardsSets = async (): Promise<Flashcard[]> => {
  try {
    const { data } = await httpAPI.get(API_ROUTES.FLASHCARDS.GET_ALL_FLASHCARD_SETS);
    return data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Fetching flashcard sets failed' };
  }
};

const getFlashcardForDocument = async (documentId: string): Promise<Flashcard[]> => {
  try {
    const { data } = await httpAPI.get(API_ROUTES.FLASHCARDS.GET_FLASHCARDS_FOR_DOC(documentId));
    return data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Fetching flashcards for document failed' };
  }
};

const reviewFlashcard = async (cardId: string, cardIndex: number) => {
  try {
    const response = await httpAPI.post(API_ROUTES.FLASHCARDS.REVIEW_FLASHCARD(cardId), { cardIndex });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Reviewing flashcard failed' };
  }
};

const toggleStar = async (cardId: string) => {
  try {
    const response = await httpAPI.put(API_ROUTES.FLASHCARDS.TOGGLE_STAR(cardId));
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Toggling star on flashcard failed' };
  }
};

const deleteFlashcardSet = async (id: string) => {
  try {
    const response = await httpAPI.delete(API_ROUTES.FLASHCARDS.DELETE_FLASHCARD_SET(id));
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Deleting flashcard set failed' };
  }
};

export const flashcardService = {
  getAllFlashcardsSets,
  getFlashcardForDocument,
  reviewFlashcard,
  toggleStar,
  deleteFlashcardSet,
};
