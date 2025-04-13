export interface Document {
  _id: string;
  userId: string;
  originalFileName: string;
  originalFileType: string;
  originalFileSize: number;
  originalFileUrl: string;
  pdfFileName?: string;
  pdfFileSize?: number;
  pdfFileUrl?: string;
  status: 'processing' | 'completed' | 'failed';
  processingStartedAt: string;
  processingCompletedAt?: string;
  errorMessage?: string;
  ocrText?: string;
  tags?: string[];
  isStarred?: boolean;
  isArchived?: boolean;
  isEncrypted?: boolean;
  encryptionMetadata?: {
    keyFingerprint?: string;
    encryptionVersion?: string;
  };
  metadata?: {
    pageCount?: number;
    dimensions?: {
      width?: number;
      height?: number;
    };
    detectedLanguage?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProcessingJob {
  _id: string;
  documentId: string;
  userId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  mistralJobId?: string;
  startTime?: string;
  endTime?: string;
  errorDetails?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  loading: boolean;
  error: string | null;
}

export interface UploadFile {
  uri: string;
  name?: string;
  type?: string;
  metadata?: {
    isEncrypted: boolean;
    keyFingerprint: string;
    encryptionVersion: string;
    [key: string]: any; // Erlaubt weitere Metadaten in Zukunft
  };
}

// Create a default export with a React component
import React from 'react';

const DocumentTypesComponent: React.FC = () => {
  return null;
};

export default DocumentTypesComponent; 