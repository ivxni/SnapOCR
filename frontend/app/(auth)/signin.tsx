import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Dimensions, StatusBar, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/common/Button';
import TextInput from '../components/common/TextInput';
import { useAuth } from '../hooks/useAuth';
import colors from '../constants/colors';
import { useDarkMode } from '../contexts/DarkModeContext';
import useThemeColors from '../utils/useThemeColors';

const { width, height } = Dimensions.get('window');

export default function SignIn() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const { isDarkMode } = useDarkMode();
  const themeColors = useThemeColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(app)/dashboard');
    }
  }, [isAuthenticated]);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(app)/dashboard');
    } catch (err) {
      setError('Invalid email or password');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: themeColors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled={Platform.OS === 'ios'}
      keyboardVerticalOffset={0}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={24} color={themeColors.text} />
      </TouchableOpacity>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <View style={[styles.logoBackground, { 
            backgroundColor: themeColors.primary,
            shadowColor: themeColors.primary
          }]}>
            <Image 
              source={require('../assets/img/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>
        
        <Text style={[styles.title, { color: themeColors.text }]}>Sign In</Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>Welcome back to SnapOCR</Text>
        
        <View style={styles.formContainer}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            floatingLabel={false}
            style={[styles.input, { shadowColor: themeColors.primary }]}
          />
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            floatingLabel={false}
            style={[styles.input, { shadowColor: themeColors.primary }]}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialIcons 
                  name={showPassword ? "visibility-off" : "visibility"} 
                  size={24} 
                  color={themeColors.textSecondary} 
                />
              </TouchableOpacity>
            }
          />
          
          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={() => {
              // Handle forgot password
            }}
          >
            <Text style={[styles.forgotPasswordText, { color: themeColors.primary }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
          
          {error && (
            <Text style={[styles.errorText, { color: themeColors.error }]}>{error}</Text>
          )}
          
          <Button 
            onPress={handleSignIn} 
            loading={loading}
            style={styles.button}
          >
            Sign In
          </Button>
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={[styles.footerLink, { color: themeColors.primary }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height - 90, // Subtract some height for the status bar and safe area
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  logoContainer: {
    marginTop: 0,
    marginBottom: 20,
    alignItems: 'center',
  },
  logoBackground: {
    borderRadius: 12,
    padding: 6,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  formContainer: {
    width: '100%',
    maxWidth: Math.min(500, width * 0.9),
  },
  input: {
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  errorText: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    marginTop: 12,
    height: 50,
    borderRadius: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 16,
  },
  footerLink: {
    fontWeight: '600',
    fontSize: 16,
  },
}); 