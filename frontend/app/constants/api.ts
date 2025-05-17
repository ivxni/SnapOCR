export const API_URL: string = 'https://7d4d-2003-c9-7717-182e-fdfd-3971-8613-cfd7.ngrok-free.app/api';

export interface ApiEndpoints {
  REGISTER: string;
  LOGIN: string;
  PROFILE: string;
  CHANGE_PASSWORD: string;
  DOCUMENTS: string;
  UPLOAD_DOCUMENT: string;
  DOCUMENT_BY_ID: (id: string) => string;
  DOCUMENT_STATUS: (id: string) => string;
}

export const ENDPOINTS: ApiEndpoints = {
  // Auth endpoints
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  PROFILE: '/auth/profile',
  CHANGE_PASSWORD: '/auth/profile',
  
  // Document endpoints
  DOCUMENTS: '/documents',
  UPLOAD_DOCUMENT: '/documents/upload',
  DOCUMENT_BY_ID: (id: string) => `/documents/${id}`,
  DOCUMENT_STATUS: (id: string) => `/documents/${id}/status`,
};

export interface ApiConfig {
  API_URL: string;
  ENDPOINTS: ApiEndpoints;
}

const apiConfig: ApiConfig = { API_URL, ENDPOINTS };

export default apiConfig; 