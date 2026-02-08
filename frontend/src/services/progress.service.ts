import httpAPI from '../utils/http';
import { API_ROUTES } from '../utils/api.routes';

import type { Document } from '../types/document.type';
import type { Quiz } from '../types/quiz.type';

export type DashboardData = {
    overview: {
        totalDocuments: number,
        totalFlashcardSets: number,
        totalFlashcards: number,
        reviewedFlashcards: number,
        starredFlashcards: number,
        totalQuizzes: number,
        completedQuizzes: number,
        averageScore: number,
        studyStreak: number
    };
    recentActivity: {
        documents: Array<Document>;
        quizzes: Array<Quiz>;
    };
}


const getDashboardData = async (): Promise<DashboardData> => {
    try {
        const response = await httpAPI.get(API_ROUTES.PROGRESS.GET_DASHBOARD);
        return response.data?.data;
    } catch (error) {
        throw error.response?.data || { message: 'Fetching dashboard data failed' };
    }
}

export const progressService = {
    getDashboardData,
};