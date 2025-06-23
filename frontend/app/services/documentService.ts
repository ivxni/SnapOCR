import api from './api';
import { ENDPOINTS } from '../constants/api';
import { Document, ProcessingJob, UploadFile, ProcessingType } from '../types/document.types';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

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
export const uploadDocument = async (file: UploadFile, processingType: ProcessingType = 'ocr'): Promise<{document: Document, processingJob: ProcessingJob}> => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name || 'document.jpg',
      type: file.type || 'image/jpeg',
    } as any);
    
    // Add processing type to form data
    formData.append('processingType', processingType);
    
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
    if (!document.downloadUrl) {
      throw new Error('PDF file not found');
    }
    
    // Korrektur des Pfads: Der downloadUrl beginnt bereits mit /uploads,
    // aber die baseURL enthält bereits /api
    // Daher müssen wir den URL-Teil korrekt erstellen:
    // Die baseURL enthält bereits "/api", und der downloadUrl beginnt mit "/uploads"
    // Erstellung des vollständigen URL ohne Dopplung des "/api"-Pfads
    const baseUrl = api.defaults.baseURL || '';
    const baseUrlWithoutApi = baseUrl.replace(/\/api$/, '');
    const pdfUrl = `${baseUrlWithoutApi}${document.downloadUrl}`;
    
    console.log('PDF URL:', pdfUrl);
    
    return pdfUrl;
  } catch (error) {
    console.error('Error getting PDF URL:', error);
    throw error;
  }
};

// Download PDF file for viewing
export const downloadPdfFile = async (id: string): Promise<string> => {
  try {
    // Just return the URL for viewing in the browser
    const fileUrl = await getPdfFileUrl(id);
    
    console.log("Using direct PDF URL:", fileUrl);
    
    // For ngrok URLs, we'll open the URL in the browser rather than embedding
    // This handles the ngrok security warning
    return fileUrl;
  } catch (error) {
    console.error('Error getting PDF URL:', error);
    throw error;
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
    if (!document.downloadUrl) {
      throw new Error('PDF file not found');
    }
    
    // Erstelle die URL zur PDF-Datei
    const baseUrl = api.defaults.baseURL || '';
    const baseUrlWithoutApi = baseUrl.replace(/\/api$/, '');
    const pdfUrl = `${baseUrlWithoutApi}${document.downloadUrl}`;
    
    // Bestimme den Dateinamen aus der URL oder verwende den Originalnamen
    const fileName = document.filename || document.originalFilename.replace(/\.[^\.]+$/, '.pdf');
    
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

/**
 * Teilt eine PDF-Datei mit anderen Apps
 * @param id Die Dokument-ID 
 */
export const sharePdf = async (id: string): Promise<void> => {
  try {
    // Prüfe, ob Sharing verfügbar ist
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Sharing is not available on this device');
    }
    
    // Lade die PDF-Datei herunter
    const localFilePath = await downloadAndSavePdf(id);
    
    // Teile die Datei
    await Sharing.shareAsync(localFilePath, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share PDF Document',
      UTI: 'com.adobe.pdf' // Für iOS
    });
    
    console.log('Sharing dialog opened successfully');
  } catch (error) {
    console.error('Error sharing PDF:', error);
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