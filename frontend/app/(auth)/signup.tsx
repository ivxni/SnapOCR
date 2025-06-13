import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Dimensions, StatusBar, Image } from 'react-native';
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

// Typ für die Passwortvalidierung
type ValidationState = {
  minLength: boolean | null;
  hasLetter: boolean | null;
  hasNumber: boolean | null;
};

export default function SignUp() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const { isDarkMode } = useDarkMode();
  const themeColors = useThemeColors();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Passwortvalidierung mit initialem neutralen Zustand
  const [passwordValidation, setPasswordValidation] = useState<ValidationState>({
    minLength: null,
    hasLetter: null,
    hasNumber: null,
  });
  
  // Passwort in Echtzeit validieren
  useEffect(() => {
    if (password.length === 0) {
      // Wenn noch kein Passwort eingegeben wurde, alle Validierungen auf null setzen
      setPasswordValidation({
        minLength: null,
        hasLetter: null,
        hasNumber: null,
      });
    } else {
      // Sonst normale Validierung durchführen
      setPasswordValidation({
        minLength: password.length >= 6,
        hasLetter: /[a-zA-Z]/.test(password),
        hasNumber: /\d/.test(password),
      });
    }
  }, [password]);
  
  // Prüfen, ob das Passwort gültig ist
  const isPasswordValid = password.length > 0 && Object.values(passwordValidation).every(value => value === true);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(app)/dashboard');
    }
  }, [isAuthenticated]);

  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !password) {
      setError('Please fill in all fields');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    if (!isPasswordValid) {
      setError('Password does not meet requirements');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register({ firstName, lastName, email, password });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(app)/dashboard');
    } catch (err) {
      setError('Failed to create account');
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
        
        <Text style={[styles.title, { color: themeColors.text }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>Join SnapOCR to get started</Text>
        
        <View style={styles.formContainer}>
          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <TextInput
                label="First Name"
                value={firstName}
                onChangeText={setFirstName}
                floatingLabel={false}
                style={[styles.input, { shadowColor: themeColors.primary }]}
              />
            </View>
            
            <View style={styles.nameField}>
              <TextInput
                label="Last Name"
                value={lastName}
                onChangeText={setLastName}
                floatingLabel={false}
                style={[styles.input, { shadowColor: themeColors.primary }]}
              />
            </View>
          </View>
          
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            floatingLabel={false}
            style={[styles.input, { shadowColor: themeColors.primary }]}
          />
          
          <View style={styles.passwordContainer}>
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              floatingLabel={false}
              style={[styles.input, { shadowColor: themeColors.primary, marginBottom: 4 }]}
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
            
            {/* Passwortvalidierungshinweise */}
            <View style={styles.passwordValidation}>
              <View style={styles.validationRow}>
                <MaterialIcons 
                  name={passwordValidation.minLength === null ? "radio-button-unchecked" : (passwordValidation.minLength ? "check-circle" : "cancel")} 
                  size={16} 
                  color={passwordValidation.minLength === null ? themeColors.textSecondary : (passwordValidation.minLength ? themeColors.success : themeColors.error)} 
                />
                <Text style={[
                  styles.validationText, 
                  { color: passwordValidation.minLength === null ? themeColors.textSecondary : (passwordValidation.minLength ? themeColors.success : themeColors.error) }
                ]}>
                  At least 6 characters
                </Text>
              </View>
              
              <View style={styles.validationRow}>
                <MaterialIcons 
                  name={passwordValidation.hasLetter === null ? "radio-button-unchecked" : (passwordValidation.hasLetter ? "check-circle" : "cancel")} 
                  size={16} 
                  color={passwordValidation.hasLetter === null ? themeColors.textSecondary : (passwordValidation.hasLetter ? themeColors.success : themeColors.error)} 
                />
                <Text style={[
                  styles.validationText, 
                  { color: passwordValidation.hasLetter === null ? themeColors.textSecondary : (passwordValidation.hasLetter ? themeColors.success : themeColors.error) }
                ]}>
                  Contains at least one letter
                </Text>
              </View>
              
              <View style={styles.validationRow}>
                <MaterialIcons 
                  name={passwordValidation.hasNumber === null ? "radio-button-unchecked" : (passwordValidation.hasNumber ? "check-circle" : "cancel")} 
                  size={16} 
                  color={passwordValidation.hasNumber === null ? themeColors.textSecondary : (passwordValidation.hasNumber ? themeColors.success : themeColors.error)} 
                />
                <Text style={[
                  styles.validationText, 
                  { color: passwordValidation.hasNumber === null ? themeColors.textSecondary : (passwordValidation.hasNumber ? themeColors.success : themeColors.error) }
                ]}>
                  Contains at least one number
                </Text>
              </View>
            </View>
          </View>
          
          {error && (
            <Text style={[styles.errorText, { color: themeColors.error }]}>{error}</Text>
          )}
          
          <Button 
            onPress={handleSignUp} 
            loading={loading}
            style={styles.button}
          >
            Sign Up
          </Button>
          
          <Text style={[styles.termsText, { color: themeColors.textSecondary }]}>
            By creating an account, you agree to our{' '}
            <Text style={[styles.termsLink, { color: themeColors.primary }]}>Terms of Service</Text> and{' '}
            <Text style={[styles.termsLink, { color: themeColors.primary }]}>Privacy Policy</Text>
          </Text>
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signin')}>
            <Text style={[styles.footerLink, { color: themeColors.primary }]}>Sign In</Text>
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
    borderRadius: 20,
    padding: 6,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  logoImage: {
    width: 70,
    height: 70,
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
  nameRow: {
    flexDirection: 'row',
    gap: 16,
  },
  nameField: {
    flex: 1,
  },
  input: {
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  passwordContainer: {
    marginBottom: 8,
  },
  passwordValidation: {
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  validationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  validationText: {
    fontSize: 12,
    marginLeft: 6,
  },
  errorText: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    marginTop: 12,
    marginBottom: 12,
    height: 50,
    borderRadius: 12,
  },
  termsText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  termsLink: {
    fontWeight: '500',
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