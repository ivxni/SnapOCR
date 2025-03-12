import React from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { lightTheme } from './constants/theme';
import { AuthProvider } from './contexts/AuthContext';
import { DocumentProvider } from './contexts/DocumentContext';

export default function RootLayout() {
  return (
    <PaperProvider theme={lightTheme}>
      <AuthProvider>
        <DocumentProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
          </Stack>
        </DocumentProvider>
      </AuthProvider>
    </PaperProvider>
  );
} 