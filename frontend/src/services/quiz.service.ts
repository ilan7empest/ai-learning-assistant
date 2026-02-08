import httpAPI from '../utils/http';
import { API_ROUTES } from '../utils/api.routes';

import type { Quiz, QuizResult } from '../types/quiz.type';

const getQuizForDocument = async (documentId: string): Promise<Quiz[]> => {
  try {
    const { data } = await httpAPI.get(API_ROUTES.QUIZZES.GET_QUIZZES_FOR_DOC(documentId));
    return data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Fetching quiz for document failed' };
  }
};

const getQuizById = async (quizId: string): Promise<Quiz> => {
  try {
    const { data } = await httpAPI.get(API_ROUTES.QUIZZES.GET_QUIZ_BY_ID(quizId));
    return data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Fetching quiz failed' };
  }
};

const submitQuiz = async (quizId: string, answers: { questionIndex: number; selectedAnswer: string }[]) => {
  try {
    const response = await httpAPI.post(API_ROUTES.QUIZZES.SUBMIT_QUIZ(quizId), { answers });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Submitting quiz failed' };
  }
};

const getQuizResults = async (quizId: string): Promise<QuizResult> => {
  try {
    const { data } = await httpAPI.get(API_ROUTES.QUIZZES.GET_QUIZ_RESULTS(quizId));
    return data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Fetching quiz results failed' };
  }
};

const deleteQuiz = async (quizId: string) => {
  try {
    const response = await httpAPI.delete(API_ROUTES.QUIZZES.DELETE_QUIZ(quizId));
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Deleting quiz failed' };
  }
};

export const quizService = {
  getQuizForDocument,
  getQuizById,
  submitQuiz,
  getQuizResults,
  deleteQuiz,
};
