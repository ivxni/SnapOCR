import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, ActivityIndicator, Switch, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../utils/i18n';
import { useDarkMode } from '../contexts/DarkModeContext';
import useThemeColors from '../utils/useThemeColors';
import authService from '../services/authService';

// Define valid icon names to avoid TypeScript errors
type IconName = 'notifications' | 'security' | 'help' | 'color-lens' | 'language' | 'logout' | 'chevron-right' | 'account-circle' | 'lock' | 'privacy-tip' | 'description' | 'brightness-4' | 'arrow-back';

interface MenuItemProps {
  icon: IconName;
  title: string;
  onPress: () => void;
  showBadge?: boolean;
  themeColors: any;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, onPress, showBadge = false, themeColors }) => (
  <TouchableOpacity 
    style={[styles.settingItem, { borderBottomColor: themeColors.border }]} 
    onPress={onPress}
  >
    <View style={styles.settingLabelContainer}>
      <MaterialIcons name={icon} size={24} color={themeColors.primary} />
      <Text style={[styles.settingLabel, { color: themeColors.text }]}>{title}</Text>
    </View>
    <View style={styles.settingLabelContainer}>
      {showBadge && <View style={[styles.badge, { backgroundColor: themeColors.error }]} />}
      <MaterialIcons name="chevron-right" size={24} color={themeColors.textSecondary} />
    </View>
  </TouchableOpacity>
);

export default function Profile() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const { t } = useTranslation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const themeColors = useThemeColors();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        // Use the authService directly since getUserProfile is not in the context
        await authService.getUserProfile();
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!user || !user.firstName) {
      fetchUserProfile();
    }
  }, []);

  const handleLogout = () => {
    Alert.alert(
      t('profile.logoutTitle'),
      t('profile.logoutConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.logout'),
          onPress: () => {
            logout();
            router.replace('/');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const navigateToLanguageSettings = () => {
    router.push('/(app)/language');
  };

  if (loading || isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>{t('profile.loadingProfile')}</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: themeColors.background }]}>
        <MaterialIcons name="error-outline" size={80} color={themeColors.error} />
        <Text style={[styles.errorText, { color: themeColors.error }]}>{t('profile.errorProfile')}</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: themeColors.surfaceVariant }]}
          onPress={() => authService.getUserProfile()}
        >
          <Text style={[styles.retryButtonText, { color: themeColors.primary }]}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <MaterialIcons name="arrow-back" size={24} color={themeColors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: themeColors.text }]}>{t('profile.title')}</Text>
          </View>
          
          <View style={styles.profileHeader}>
            {user.profilePicture ? (
              <Image 
                source={{ uri: user.profilePicture }} 
                style={styles.avatar} 
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: themeColors.primary }]}>
                <Text style={[styles.avatarInitial, { color: themeColors.white }]}>
                  {user.firstName ? user.firstName.charAt(0).toUpperCase() : '?'}
                </Text>
              </View>
            )}
            
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: themeColors.text }]}>
                {user.firstName} {user.lastName}
              </Text>
              <Text style={[styles.profileEmail, { color: themeColors.textSecondary }]}>
                {user.email}
              </Text>
            </View>
            
            <TouchableOpacity style={[styles.editButton, { backgroundColor: themeColors.surfaceVariant }]}>
              <MaterialIcons name="edit" size={20} color={themeColors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={[styles.section, { 
          backgroundColor: themeColors.surface,
          shadowColor: themeColors.primary
        }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            {t('profile.settings')}
          </Text>
          
          {/* Dark Mode Setting */}
          <View style={[styles.settingItem, { borderBottomColor: themeColors.border }]}>
            <View style={styles.settingLabelContainer}>
              <MaterialIcons name="brightness-4" size={24} color={themeColors.text} />
              <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                {t('profile.darkMode')}
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: themeColors.disabled, true: themeColors.primaryLight }}
              thumbColor={isDarkMode ? themeColors.primary : themeColors.disabled}
            />
          </View>

          {/* Language Setting */}
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: themeColors.border }]}
            onPress={navigateToLanguageSettings}
          >
            <View style={styles.settingLabelContainer}>
              <MaterialIcons name="language" size={24} color={themeColors.text} />
              <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                {t('profile.language')}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.section, { 
          backgroundColor: themeColors.surface,
          shadowColor: themeColors.primary
        }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            {t('profile.account')}
          </Text>
          
          {/* Change Password */}
          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: themeColors.border }]}>
            <View style={styles.settingLabelContainer}>
              <MaterialIcons name="lock" size={24} color={themeColors.text} />
              <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                {t('profile.changePassword')}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={themeColors.textSecondary} />
          </TouchableOpacity>
          
          {/* Privacy Policy */}
          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: themeColors.border }]}>
            <View style={styles.settingLabelContainer}>
              <MaterialIcons name="privacy-tip" size={24} color={themeColors.text} />
              <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                {t('profile.privacyPolicy')}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={themeColors.textSecondary} />
          </TouchableOpacity>
          
          {/* Terms of Service */}
          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: themeColors.border }]}>
            <View style={styles.settingLabelContainer}>
              <MaterialIcons name="description" size={24} color={themeColors.text} />
              <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                {t('profile.termsOfService')}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: themeColors.error }]}
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={24} color={themeColors.white} />
          <Text style={[styles.logoutButtonText, { color: themeColors.white }]}>
            {t('common.logout')}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: themeColors.textSecondary }]}>
            {t('common.version')} 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    fontWeight: '500',
  },
  header: {
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    justifyContent: 'center',
    height: 60,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    top: '50%',
    transform: [{ translateY: -20 }],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginVertical: 8,
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  versionText: {
    fontSize: 14,
  },
}); 