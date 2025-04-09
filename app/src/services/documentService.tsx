import { apiClient } from './apiClient.tsx';

// Typdefinitionen
interface DocumentResponse {
  success: boolean;
  documentId: string;
  message: string;
}

interface DocumentStatusResponse {
  success: boolean;
  data: {
    id: string;
    status: string;
    originalFileName: string;
    createdAt: string;
    completedAt: string | null;
  };
}

interface DocumentsListResponse {
  success: boolean;
  count: number;
  data: Array<{
    id: string;
    originalFileName: string;
    status: string;
    createdAt: string;
    completedAt: string | null;
    fileSize: number;
    storageUrl: string | null;
  }>;
}

// Dokument hochladen
export const uploadDocument = async (file: File): Promise<DocumentResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<DocumentResponse>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Fehler beim Hochladen des Dokuments:', error);
    throw error;
  }
};

// Dokumentstatus abrufen
export const getDocumentStatus = async (documentId: string): Promise<DocumentStatusResponse> => {
  try {
    const response = await apiClient.get<DocumentStatusResponse>(`/documents/${documentId}/status`);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Abrufen des Dokumentstatus:', error);
    throw error;
  }
};

// Alle Dokumente des Benutzers abrufen
export const getUserDocuments = async (): Promise<DocumentsListResponse> => {
  try {
    const response = await apiClient.get<DocumentsListResponse>('/documents');
    return response.data;
  } catch (error) {
    console.error('Fehler beim Abrufen der Dokumente:', error);
    throw error;
  }
};

// Dokument archivieren
export const archiveDocument = async (documentId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.put<{ success: boolean; message: string }>(`/documents/${documentId}/archive`);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Archivieren des Dokuments:', error);
    throw error;
  }
}; 