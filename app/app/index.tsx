import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AppLayout from './components/layout/AppLayout';
import Button from './components/common/Button';
import colors from './constants/colors';
import { useAuth } from './hooks/useAuth';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(app)/dashboard');
    }
  }, [isAuthenticated]);

  return (
    <AppLayout>
      <View style={styles.container}>
        <View style={styles.main}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <Text style={styles.logoText}>L</Text>
            </View>
          </View>
          
          <Text style={styles.title}>LynxAI</Text>
          <Text style={styles.subtitle}>OCR Document Processing</Text>
          
          <View style={styles.description}>
            <Text style={styles.descriptionText}>
              Scan, analyze, and extract data from your documents with powerful AI technology
            </Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <Button 
              onPress={() => router.push('/(auth)/signin')}
              style={styles.button}
            >
              Sign In
            </Button>
            
            <Button 
              variant="outline"
              onPress={() => router.push('/(auth)/signup')}
              style={styles.button}
            >
              Create Account
            </Button>
          </View>
        </View>
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 960,
    marginHorizontal: 'auto',
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoBackground: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  logoText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: colors.white,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  descriptionText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    marginTop: 16,
    alignItems: 'center',
  },
  button: {
    marginBottom: 16,
    width: '100%',
  },
}); 