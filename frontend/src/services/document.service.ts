import httpAPI from '../utils/http';
import { API_ROUTES } from '../utils/api.routes';

import type { Document } from '../types/document.type';

const getDocuments = async (): Promise<Document[]> => {
  try {
    const { data } = await httpAPI.get(API_ROUTES.DOCUMENTS.GET_DOCUMENTS);
    return data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Fetching documents failed' };
  }
};

const getDocumentById = async (id: string): Promise<Document> => {
  try {
    const { data } = await httpAPI.get(API_ROUTES.DOCUMENTS.GET_DOCUMENT_BY_ID(id));
    return data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Fetching document failed' };
  }
};

const uploadDocument = async (formData: FormData) => {
  try {
    const response = await httpAPI.post(API_ROUTES.DOCUMENTS.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Uploading document failed' };
  }
};

const deleteDocument = async (id: string) => {
  try {
    const response = await httpAPI.delete(API_ROUTES.DOCUMENTS.DELETE_DOCUMENT(id));
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Deleting document failed' };
  }
};

export const documentService = {
  getDocuments,
  getDocumentById,
  uploadDocument,
  deleteDocument,
};
