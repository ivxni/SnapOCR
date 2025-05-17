import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';
import { SubscriptionDetails } from '../types/auth.types';

// Set up axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Get subscription details
 */
const getSubscriptionDetails = async (): Promise<SubscriptionDetails> => {
  try {
    const response = await api.get('/subscription');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get subscription details');
  }
};

/**
 * Start free trial
 */
const startFreeTrial = async (): Promise<{message: string; subscription: any}> => {
  try {
    const response = await api.post('/subscription/trial');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to start free trial');
  }
};

/**
 * Subscribe to premium plan
 */
const subscribeToPremium = async (billingCycle: 'monthly' | 'yearly'): Promise<{message: string; subscription: any}> => {
  try {
    const response = await api.post('/subscription/premium', { billingCycle });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to subscribe to premium');
  }
};

/**
 * Cancel subscription
 */
const cancelSubscription = async (): Promise<{message: string; subscription: any}> => {
  try {
    const response = await api.post('/subscription/cancel');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to cancel subscription');
  }
};

/**
 * Check if user can process document
 */
const canProcessDocument = async (): Promise<{
  canProcess: boolean;
  remainingDocuments: number;
  plan: 'free' | 'premium';
  usedDocuments: number;
  totalDocuments: number;
}> => {
  try {
    const response = await api.get('/subscription/can-process');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to check document processing capability');
  }
};

/**
 * Get subscription details optimized for Dashboard refreshes
 * with more verbose logging to help debug refresh issues
 */
const getDashboardSubscriptionInfo = async (): Promise<{
  plan: 'free' | 'premium';
  isInTrial: boolean;
  remainingDocuments: number;
  totalDocuments: number;
}> => {
  try {
    console.log('Fetching fresh subscription details for dashboard...');
    const response = await api.get('/subscription');
    
    const data = response.data;
    console.log('Dashboard subscription update:', {
      plan: data.plan,
      isInTrial: data.isInTrial,
      remaining: data.documentLimitRemaining,
      total: data.documentLimitTotal
    });
    
    return {
      plan: data.plan,
      isInTrial: data.isInTrial,
      remainingDocuments: data.documentLimitRemaining,
      totalDocuments: data.documentLimitTotal
    };
  } catch (error: any) {
    console.error('Error fetching dashboard subscription info:', error);
    throw new Error(error.response?.data?.message || 'Failed to get subscription details');
  }
};

const subscriptionService = {
  getSubscriptionDetails,
  startFreeTrial,
  subscribeToPremium,
  cancelSubscription,
  canProcessDocument,
  getDashboardSubscriptionInfo,
};

export default subscriptionService; 