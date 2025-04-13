import api from './api';
import { ENDPOINTS } from '../constants/api';
import { Document, ProcessingJob, UploadFile } from '../types/document.types';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { decryptFile } from '../utils/encryption';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper functions for authentication
const getTokenFromSecureStore = async (): Promise<string> => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication token not found');
  }
  return token;
};

const getUrl = async (): Promise<string> => {
  return api.defaults.baseURL || '';
};

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
    
    // Füge die Datei zum FormData hinzu
    formData.append('file', {
      uri: file.uri,
      name: file.name || 'document.jpg',
      type: file.type || 'image/jpeg',
    } as any);
    
    // Füge Metadaten hinzu, wenn vorhanden
    if (file.metadata) {
      formData.append('metadata', JSON.stringify(file.metadata));
    }
    
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

// Get PDF file URL for viewing
export const getPdfFileUrl = async (id: string): Promise<string> => {
  try {
    const document = await getDocumentById(id);
    if (!document.pdfFileUrl) {
      throw new Error('PDF file not found');
    }
    
    // Korrektur des Pfads: Der pdfFileUrl beginnt bereits mit /uploads,
    // aber die baseURL enthält bereits /api
    // Daher müssen wir den URL-Teil korrekt erstellen:
    // Die baseURL enthält bereits "/api", und der pdfFileUrl beginnt mit "/uploads"
    // Erstellung des vollständigen URL ohne Dopplung des "/api"-Pfads
    const baseUrl = api.defaults.baseURL || '';
    const baseUrlWithoutApi = baseUrl.replace(/\/api$/, '');
    const pdfUrl = `${baseUrlWithoutApi}${document.pdfFileUrl}`;
    
    console.log('PDF URL:', pdfUrl);
    
    return pdfUrl;
  } catch (error) {
    console.error('Error getting PDF URL:', error);
    throw error;
  }
};

// Download PDF file
export const downloadPdfFile = async (id: string, onLoadingChange: (isLoading: boolean) => void) => {
  try {
    onLoadingChange(true);
    const token = await getTokenFromSecureStore();
    const serverUrl = await getUrl();
    const downloadUrl = `${serverUrl}${ENDPOINTS.DOCUMENT_ORIGINAL(id)}`;
    console.log('Downloading original PDF from: ', downloadUrl);
    
    try {
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('Authentication failed when downloading document. Token may be expired.');
          throw new Error('Authentication failed when downloading document');
        }
        console.error(`Failed to download original file: status ${response.status}`);
        throw new Error(`Failed to download original file: status ${response.status}`);
      }
      
      const blob = await response.blob();
      const fileUri = FileSystem.documentDirectory + `${id}.pdf`;
      
      const fileString = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
      const base64Data = fileString.split(',')[1];
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      console.log('Download result:', { uri: fileUri });
      return { uri: fileUri };
    } catch (error) {
      console.error('Error downloading original file:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in downloadPdfFile:', error);
    throw error;
  } finally {
    onLoadingChange(false);
  }
};

/**
 * Lädt die PDF-Datei herunter und gibt den lokalen Pfad zurück
 * @param id Die Dokument-ID
 * @returns Der lokale Pfad zur heruntergeladenen PDF-Datei
 */
export const downloadAndSavePdf = async (id: string): Promise<string> => {
  try {
    // Hole Dokument-Details, um den Dateinamen zu erhalten
    const document = await getDocumentById(id);
    if (!document.pdfFileUrl) {
      throw new Error('PDF file not found');
    }
    
    // Erstelle die URL zur PDF-Datei
    const baseUrl = api.defaults.baseURL || '';
    const baseUrlWithoutApi = baseUrl.replace(/\/api$/, '');
    const pdfUrl = `${baseUrlWithoutApi}${document.pdfFileUrl}`;
    
    // Bestimme den Dateinamen aus der URL oder verwende den Originalnamen
    const fileName = document.pdfFileName || document.originalFileName.replace(/\.[^\.]+$/, '.pdf');
    
    // Lokaler Pfad, wohin die Datei gespeichert werden soll
    const localFilePath = `${FileSystem.cacheDirectory}${fileName}`;
    
    console.log(`Downloading PDF from ${pdfUrl} to ${localFilePath}`);
    
    // Lade die Datei herunter
    const downloadResumable = FileSystem.createDownloadResumable(
      pdfUrl,
      localFilePath,
      {},
      (downloadProgress) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        console.log(`Download progress: ${progress * 100}%`);
      }
    );
    
    const downloadResult = await downloadResumable.downloadAsync();
    
    if (!downloadResult || !downloadResult.uri) {
      throw new Error('Failed to download file');
    }
    
    console.log('PDF downloaded successfully to:', downloadResult.uri);
    return downloadResult.uri;
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};

// Share PDF
export const sharePdf = async (id: string): Promise<void> => {
  try {
    // Lade die Datei herunter (unterstützt jetzt auch Entschlüsselung)
    const fileInfo = await downloadPdfFile(id, (isLoading) => {
      // Handle loading state if needed
      console.log('Download loading:', isLoading);
    });
    
    // Überprüfe, ob Sharing verfügbar ist
    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (!isSharingAvailable) {
      throw new Error('Sharing is not available on this device');
    }
    
    // Teile die Datei
    await Sharing.shareAsync(fileInfo.uri);
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
  getPdfFileUrl,
  downloadPdfFile,
  downloadAndSavePdf,
  sharePdf,
}; 