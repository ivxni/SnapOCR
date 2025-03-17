import api, { setAuthToken, clearAuthToken } from './api';
import { ENDPOINTS } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, RegisterData, ProfileUpdateData } from '../types/auth.types';

// Register a new user
export const register = async (userData: RegisterData): Promise<User> => {
  try {
    const response = await api.post(ENDPOINTS.REGISTER, userData);
    
    if (response.data.token) {
      await setAuthToken(response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Login user
export const login = async (email: string, password: string): Promise<User> => {
  try {
    const response = await api.post(ENDPOINTS.LOGIN, { email, password });
    
    if (response.data.token) {
      await setAuthToken(response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Logout user
export const logout = async (): Promise<void> => {
  try {
    await clearAuthToken();
  } catch (error) {
    throw error;
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await api.get(ENDPOINTS.PROFILE);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userData: ProfileUpdateData): Promise<User> => {
  try {
    const response = await api.put(ENDPOINTS.PROFILE, userData);
    
    if (response.data) {
      const currentUser = await AsyncStorage.getItem('user');
      if (currentUser) {
        const parsedUser = JSON.parse(currentUser);
        const updatedUser = { ...parsedUser, ...response.data };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
}; 