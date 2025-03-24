export const API_URL: string = 'https://2bfe-2003-c9-770f-4787-2d72-af39-22b7-7248.ngrok-free.app/api';

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