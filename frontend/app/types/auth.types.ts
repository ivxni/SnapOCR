export interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  preferences?: {
    notifications: boolean;
    theme: string;
    language: string;
  };
  token?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ProfileUpdateData {
  email?: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  password?: string;
  preferences?: {
    notifications?: boolean;
    theme?: string;
    language?: string;
  };
}

// Create a default export with a React component
import React from 'react';

const AuthTypesComponent: React.FC = () => {
  return null;
};

export default AuthTypesComponent; 