import axios from 'axios';

// API-Basis-URL
const API_URL = 'http://localhost:3001/api';

// Axios-Instanz erstellen
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request-Interceptor für das Hinzufügen des Auth-Tokens
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response-Interceptor für die Fehlerbehandlung
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Automatische Abmeldung bei 401-Fehlern (nicht autorisiert)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
); 