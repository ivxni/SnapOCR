import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { lightTheme } from './constants/theme';
import { AuthProvider } from './contexts/AuthContext';
import { DocumentProvider } from './contexts/DocumentContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { useAuth } from './hooks/useAuth';

// Auth protection component
function AuthProtection() {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Check if the user is authenticated
    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';

    if (isAuthenticated && inAuthGroup) {
      // Redirect to the dashboard if the user is authenticated and trying to access auth screens
      router.replace('/(app)/dashboard');
    } else if (!isAuthenticated && inAppGroup) {
      // Redirect to the sign-in page if the user is not authenticated and trying to access app screens
      router.replace('/');
    }
  }, [isAuthenticated, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <PaperProvider theme={lightTheme}>
      <LanguageProvider>
        <AuthProvider>
          <DocumentProvider>
            <AuthProtection />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen 
                name="(app)" 
                options={{ 
                  headerShown: false,
                  // Prevent going back to the get started screen
                  gestureEnabled: false
                }} 
              />
            </Stack>
          </DocumentProvider>
        </AuthProvider>
      </LanguageProvider>
    </PaperProvider>
  );
} 