import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import TextInput from '../components/common/TextInput';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../utils/i18n';
import { useDarkMode } from '../contexts/DarkModeContext';
import useThemeColors from '../utils/useThemeColors';
import authService from '../services/authService';

export default function ChangePassword() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isDarkMode } = useDarkMode();
  const themeColors = useThemeColors();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChangePassword = async () => {
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(t('profile.allFieldsRequired'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('profile.passwordsDoNotMatch'));
      return;
    }

    if (newPassword.length < 6) {
      setError(t('profile.passwordTooShort'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.changePassword(currentPassword, newPassword);
      Alert.alert(
        t('common.success'),
        t('profile.passwordChanged'),
        [{ text: t('common.ok'), onPress: () => router.back() }]
      );
    } catch (err: any) {
      setError(err.message || t('profile.passwordChangeFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color={themeColors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>
            {t('profile.changePassword')}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <TextInput
              label={t('profile.currentPassword')}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              style={[styles.input, { shadowColor: themeColors.primary }]}
            />
            
            <TextInput
              label={t('profile.newPassword')}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              style={[styles.input, { shadowColor: themeColors.primary }]}
            />
            
            <TextInput
              label={t('profile.confirmPassword')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={[styles.input, { shadowColor: themeColors.primary }]}
            />
            
            {error && (
              <Text style={[styles.errorText, { color: themeColors.error }]}>{error}</Text>
            )}
            
            <Button 
              onPress={handleChangePassword} 
              loading={loading}
              style={styles.button}
            >
              {t('common.save')}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  errorText: {
    marginBottom: 16,
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    height: 50,
    borderRadius: 12,
  },
}); 