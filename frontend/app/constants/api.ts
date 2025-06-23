export const API_URL: string = 'https://015f-2003-c9-770e-958a-d1fd-d663-801b-d269.ngrok-free.app/api';

export interface ApiEndpoints {
  REGISTER: string;
  LOGIN: string;
  APPLE_SIGNIN: string;
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
  APPLE_SIGNIN: '/auth/apple-signin',
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