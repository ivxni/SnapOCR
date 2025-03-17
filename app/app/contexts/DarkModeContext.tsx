import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';

type DarkModeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
};

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};

interface DarkModeProviderProps {
  children: ReactNode;
}

export const DarkModeProvider: React.FC<DarkModeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved dark mode preference
  useEffect(() => {
    const loadDarkModePreference = async () => {
      try {
        const savedPreference = await AsyncStorage.getItem('darkMode');
        if (savedPreference !== null) {
          setIsDarkMode(savedPreference === 'true');
        }
      } catch (error) {
        console.error('Error loading dark mode preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDarkModePreference();
  }, []);

  // Save dark mode preference when it changes
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem('darkMode', isDarkMode.toString()).catch(error => {
        console.error('Error saving dark mode preference:', error);
      });
    }
  }, [isDarkMode, isLoading]);

  // Handle app state changes to ensure theme is applied correctly
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Force a re-render when app becomes active
        setIsDarkMode(prev => prev);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export default DarkModeProvider; 