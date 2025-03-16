import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, ActivityIndicator, Switch, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../utils/i18n';
import authService from '../services/authService';

// Define valid icon names to avoid TypeScript errors
type IconName = 'notifications' | 'security' | 'help' | 'color-lens' | 'language' | 'logout' | 'chevron-right' | 'account-circle' | 'lock' | 'privacy-tip' | 'description' | 'brightness-4' | 'arrow-back';

interface MenuItemProps {
  icon: IconName;
  title: string;
  onPress: () => void;
  showBadge?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, onPress, showBadge = false }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    <View style={styles.settingLabelContainer}>
      <MaterialIcons name={icon} size={24} color={colors.primary} />
      <Text style={styles.settingLabel}>{title}</Text>
    </View>
    <View style={styles.settingLabelContainer}>
      {showBadge && <View style={styles.badge} />}
      <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
    </View>
  </TouchableOpacity>
);

export default function Profile() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

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
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('profile.loadingProfile')}</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <MaterialIcons name="error-outline" size={80} color={colors.error} />
        <Text style={styles.errorText}>{t('profile.errorProfile')}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => authService.getUserProfile()}
        >
          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <MaterialIcons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('profile.title')}</Text>
          </View>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {user.profilePicture ? (
                <Image source={{ uri: user.profilePicture }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {user.firstName?.charAt(0) || ''}{user.lastName?.charAt(0) || ''}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.userName}>{`${user.firstName || ''} ${user.lastName || ''}`}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>{t('profile.editProfile')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
          
          {/* Notifications Setting */}
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <MaterialIcons name="notifications" size={24} color={colors.text} />
              <Text style={styles.settingLabel}>{t('profile.notifications')}</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.disabled, true: colors.primaryLight }}
              thumbColor={notificationsEnabled ? colors.primary : colors.disabled}
            />
          </View>
          
          {/* Dark Mode Setting */}
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <MaterialIcons name="brightness-4" size={24} color={colors.text} />
              <Text style={styles.settingLabel}>{t('profile.darkMode')}</Text>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: colors.disabled, true: colors.primaryLight }}
              thumbColor={darkModeEnabled ? colors.primary : colors.disabled}
            />
          </View>

          {/* Language Setting */}
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={navigateToLanguageSettings}
          >
            <View style={styles.settingLabelContainer}>
              <MaterialIcons name="language" size={24} color={colors.text} />
              <Text style={styles.settingLabel}>{t('profile.language')}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.accountSection}>
          <Text style={styles.sectionTitle}>{t('profile.account')}</Text>
          
          {/* Change Password */}
          <TouchableOpacity style={styles.accountItem}>
            <View style={styles.accountItemLabelContainer}>
              <MaterialIcons name="lock" size={24} color={colors.text} />
              <Text style={styles.accountItemLabel}>{t('profile.changePassword')}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          
          {/* Privacy Policy */}
          <TouchableOpacity style={styles.accountItem}>
            <View style={styles.accountItemLabelContainer}>
              <MaterialIcons name="privacy-tip" size={24} color={colors.text} />
              <Text style={styles.accountItemLabel}>{t('profile.privacyPolicy')}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          
          {/* Terms of Service */}
          <TouchableOpacity style={styles.accountItem}>
            <View style={styles.accountItemLabelContainer}>
              <MaterialIcons name="description" size={24} color={colors.text} />
              <Text style={styles.accountItemLabel}>{t('profile.termsOfService')}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={24} color={colors.white} />
          <Text style={styles.logoutButtonText}>{t('common.logout')}</Text>
        </TouchableOpacity>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>{t('common.version')} 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: colors.error,
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.primary,
    fontWeight: '500',
  },
  header: {
    backgroundColor: colors.white,
    paddingBottom: 24,
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
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 16,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.white,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  settingsSection: {
    backgroundColor: colors.white,
    marginTop: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
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
    borderBottomColor: colors.border,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    marginRight: 8,
  },
  accountSection: {
    backgroundColor: colors.white,
    marginTop: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  accountItemLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountItemLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.error,
    borderRadius: 12,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.white,
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  versionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
}); 