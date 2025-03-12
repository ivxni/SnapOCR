import { apiClient } from './apiClient.tsx';

// Typdefinitionen
interface User {
  id: string;
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

interface RegisterResponse {
  success: boolean;
  token: string;
  user: User;
}

interface UserResponse {
  success: boolean;
  data: User;
}

// Token im localStorage speichern
const setToken = (token: string) => {
  localStorage.setItem('token', token);
};

// Token aus dem localStorage abrufen
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Token aus dem localStorage entfernen
const removeToken = () => {
  localStorage.removeItem('token');
};

// Benutzer anmelden
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });
    
    if (response.data.success && response.data.token) {
      setToken(response.data.token);
      return response.data.user;
    } else {
      throw new Error('Anmeldung fehlgeschlagen');
    }
  } catch (error) {
    console.error('Fehler bei der Anmeldung:', error);
    throw error;
  }
};

// Benutzer registrieren
export const registerUser = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<User> => {
  try {
    const response = await apiClient.post<RegisterResponse>('/auth/register', {
      firstName,
      lastName,
      email,
      password
    });
    
    if (response.data.success && response.data.token) {
      setToken(response.data.token);
      return response.data.user;
    } else {
      throw new Error('Registrierung fehlgeschlagen');
    }
  } catch (error) {
    console.error('Fehler bei der Registrierung:', error);
    throw error;
  }
};

// Aktuellen Benutzer abrufen
export const getCurrentUser = async (): Promise<User | null> => {
  const token = getToken();
  
  if (!token) {
    return null;
  }
  
  try {
    const response = await apiClient.get<UserResponse>('/auth/me');
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error('Fehler beim Abrufen des Benutzers');
    }
  } catch (error) {
    console.error('Fehler beim Abrufen des Benutzers:', error);
    removeToken();
    return null;
  }
};

// Benutzer abmelden
export const logoutUser = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('Fehler beim Abmelden:', error);
  } finally {
    removeToken();
  }
}; 