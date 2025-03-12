import api from './api';
import { ENDPOINTS } from '../constants/api';
import { Document, ProcessingJob, UploadFile } from '../types/document.types';

// Get all documents
export const getDocuments = async (): Promise<Document[]> => {
  try {
    const response = await api.get(ENDPOINTS.DOCUMENTS);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get document by ID
export const getDocumentById = async (id: string): Promise<Document> => {
  try {
    const response = await api.get(ENDPOINTS.DOCUMENT_BY_ID(id));
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Upload document
export const uploadDocument = async (file: UploadFile): Promise<{document: Document, processingJob: ProcessingJob}> => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name || 'document.jpg',
      type: file.type || 'image/jpeg',
    } as any);
    
    const response = await api.post(ENDPOINTS.UPLOAD_DOCUMENT, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update document status
export const updateDocumentStatus = async (id: string, status: 'processing' | 'completed' | 'failed'): Promise<Document> => {
  try {
    const response = await api.put(ENDPOINTS.DOCUMENT_STATUS(id), { status });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete document
export const deleteDocument = async (id: string): Promise<{message: string}> => {
  try {
    const response = await api.delete(ENDPOINTS.DOCUMENT_BY_ID(id));
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get processing job status
export const getProcessingJobStatus = async (id: string): Promise<ProcessingJob> => {
  try {
    const response = await api.get(`${ENDPOINTS.DOCUMENT_BY_ID(id)}/job`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getDocuments,
  getDocumentById,
  uploadDocument,
  updateDocumentStatus,
  deleteDocument,
  getProcessingJobStatus,
}; 