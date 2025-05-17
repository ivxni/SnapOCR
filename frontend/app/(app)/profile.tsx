import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { useAuth } from '../hooks/useAuth';
import { useLanguage, LANGUAGES } from '../contexts/LanguageContext';
import { useTranslation } from '../utils/i18n';
import { useDarkMode, ThemeMode } from '../contexts/DarkModeContext';
import useThemeColors from '../utils/useThemeColors';
import authService from '../services/authService';
import subscriptionService from '../services/subscriptionService';
import { SubscriptionDetails } from '../types/auth.types';

// Define valid icon names to avoid TypeScript errors
type IconName = 'notifications' | 'security' | 'help' | 'color-lens' | 'language' | 'logout' | 'chevron-right' | 'account-circle' | 'lock' | 'privacy-tip' | 'description' | 'brightness-4' | 'arrow-back' | 'star' | 'payments' | 'calendar-today';

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
  const { themeMode, setThemeMode } = useDarkMode();
  const themeColors = useThemeColors();
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Refresh data when profile comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('Profile is focused - refreshing subscription data');
      fetchSubscriptionInfo();
      return () => {
        // Nothing to clean up
      };
    }, [])
  );

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        // Use the authService directly since getUserProfile is not in the context
        await authService.getUserProfile();
        await fetchSubscriptionInfo();
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!user || !user.firstName) {
      fetchUserProfile();
    } else {
      fetchSubscriptionInfo();
    }
  }, [user]);

  const fetchSubscriptionInfo = async () => {
    try {
      setSubscriptionLoading(true);
      const details = await subscriptionService.getSubscriptionDetails();
      setSubscriptionDetails(details);
      setIsInitialized(true);
      console.log('Profile updated with subscription info:', details.plan, details.isInTrial ? '(TRIAL)' : '');
    } catch (error) {
      console.error('Error fetching subscription details:', error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleStartTrial = async () => {
    try {
      setSubscriptionLoading(true);
      await subscriptionService.startFreeTrial();
      await fetchSubscriptionInfo();
      Alert.alert(
        'Free Trial Started',
        'You have successfully started your 7-day free trial of premium features!',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start free trial');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleSubscribe = (billingCycle: 'monthly' | 'yearly') => {
    Alert.alert(
      'Confirm Subscription',
      `Are you sure you want to subscribe to the ${billingCycle} premium plan?\n\n${
        billingCycle === 'monthly' ? 
        `$${subscriptionDetails?.pricing.monthly}/month` : 
        `$${subscriptionDetails?.pricing.yearly}/year (save ${Math.round(100 - (subscriptionDetails?.pricing.yearly || 0) / 12 / (subscriptionDetails?.pricing.monthly || 1) * 100)}%)`
      }`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Subscribe', 
          onPress: async () => {
            try {
              setSubscriptionLoading(true);
              await subscriptionService.subscribeToPremium(billingCycle);
              await fetchSubscriptionInfo();
              Alert.alert(
                'Subscription Successful',
                `You have successfully subscribed to the ${billingCycle} premium plan!`,
                [{ text: 'OK' }]
              );
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to subscribe');
            } finally {
              setSubscriptionLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your premium subscription?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              setSubscriptionLoading(true);
              await subscriptionService.cancelSubscription();
              await fetchSubscriptionInfo();
              Alert.alert(
                'Subscription Cancelled',
                'Your premium subscription has been cancelled.',
                [{ text: 'OK' }]
              );
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to cancel subscription');
            } finally {
              setSubscriptionLoading(false);
            }
          }
        }
      ]
    );
  };

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

  const navigateToDarkModeSettings = () => {
    router.push('/(app)/darkmode');
  };

  const navigateToEditProfile = () => {
    router.push('/(app)/editprofile');
  };

  const navigateToChangePassword = () => {
    router.push('/(app)/changepassword');
  };

  const handleThemeModeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const showThemeOptions = () => {
    Alert.alert(
      t('profile.darkMode'),
      t('profile.selectTheme'),
      [
        {
          text: t('profile.systemDefault'),
          onPress: () => handleThemeModeChange('system'),
          style: themeMode === 'system' ? 'default' : 'default',
        },
        {
          text: t('profile.lightMode'),
          onPress: () => handleThemeModeChange('light'),
          style: themeMode === 'light' ? 'default' : 'default',
        },
        {
          text: t('profile.darkMode'),
          onPress: () => handleThemeModeChange('dark'),
          style: themeMode === 'dark' ? 'default' : 'default',
        },
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
      ]
    );
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
            <View style={styles.placeholder} />
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

              {/* Subscription badge */}
              {isInitialized && subscriptionDetails && (
                <View style={[
                  styles.subscriptionBadge, 
                  { 
                    backgroundColor: subscriptionDetails.plan === 'premium' 
                      ? themeColors.primary 
                      : themeColors.surfaceVariant,
                    opacity: subscriptionLoading ? 0.7 : 1 // Slight opacity during loading
                  }
                ]}>
                  <Text style={[
                    styles.subscriptionText, 
                    { 
                      color: subscriptionDetails.plan === 'premium' 
                        ? themeColors.white 
                        : themeColors.text
                    }
                  ]}>
                    {subscriptionDetails.isInTrial ? t('subscription.trial') : subscriptionDetails.plan === 'premium' ? t('subscription.premium') : t('subscription.free')}
                  </Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity 
              style={[styles.editButton, { backgroundColor: themeColors.surfaceVariant }]}
              onPress={navigateToEditProfile}
            >
              <MaterialIcons name="edit" size={20} color={themeColors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Subscription Section - Only hide it on very first load */}
        {isInitialized && subscriptionDetails && (
          <View style={[styles.section, { 
            backgroundColor: themeColors.surface,
            shadowColor: themeColors.primary,
            opacity: subscriptionLoading ? 0.7 : 1  // Slight opacity during refresh
          }]}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              {t('subscription.title')}
            </Text>
            
            <View style={styles.subscriptionInfo}>
              <View style={styles.subscriptionDetail}>
                <Text style={[styles.subscriptionLabel, { color: themeColors.textSecondary }]}>{t('subscription.plan')}:</Text>
                <Text style={[styles.subscriptionValue, { color: themeColors.text }]}>
                  {subscriptionDetails.plan === 'premium' ? t('subscription.premium') : t('subscription.free')}
                  {subscriptionDetails.isInTrial ? ` (${t('subscription.trial')})` : ''}
                </Text>
              </View>

              {subscriptionDetails.plan === 'premium' && (
                <>
                  <View style={styles.subscriptionDetail}>
                    <Text style={[styles.subscriptionLabel, { color: themeColors.textSecondary }]}>{t('subscription.billing')}:</Text>
                    <Text style={[styles.subscriptionValue, { color: themeColors.text }]}>
                      {subscriptionDetails.billingCycle === 'monthly' ? t('subscription.monthly') : 
                        subscriptionDetails.billingCycle === 'yearly' ? t('subscription.yearly') : 'None'}
                    </Text>
                  </View>

                  {subscriptionDetails.isInTrial && subscriptionDetails.trialEndDate && (
                    <View style={styles.subscriptionDetail}>
                      <Text style={[styles.subscriptionLabel, { color: themeColors.textSecondary }]}>{t('subscription.trialEnds')}:</Text>
                      <Text style={[styles.subscriptionValue, { color: themeColors.text }]}>
                        {new Date(subscriptionDetails.trialEndDate).toLocaleDateString()}
                      </Text>
                    </View>
                  )}

                  {!subscriptionDetails.isInTrial && subscriptionDetails.nextBillingDate && (
                    <View style={styles.subscriptionDetail}>
                      <Text style={[styles.subscriptionLabel, { color: themeColors.textSecondary }]}>{t('subscription.nextBilling')}:</Text>
                      <Text style={[styles.subscriptionValue, { color: themeColors.text }]}>
                        {new Date(subscriptionDetails.nextBillingDate).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </>
              )}

              <View style={styles.subscriptionDetail}>
                <Text style={[styles.subscriptionLabel, { color: themeColors.textSecondary }]}>{t('subscription.documents')}:</Text>
                <Text style={[styles.subscriptionValue, { color: themeColors.text }]}>
                  {subscriptionDetails.documentLimitRemaining} of {subscriptionDetails.documentLimitTotal} {t('subscription.documentsRemaining')}
                </Text>
              </View>

              {subscriptionDetails.resetDate && (
                <View style={styles.subscriptionDetail}>
                  <Text style={[styles.subscriptionLabel, { color: themeColors.textSecondary }]}>{t('subscription.resetsOn')}:</Text>
                  <Text style={[styles.subscriptionValue, { color: themeColors.text }]}>
                    {new Date(subscriptionDetails.resetDate).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>

            {/* Action buttons become disabled during loading */}
            {subscriptionDetails.plan === 'free' ? (
              <View style={styles.subscriptionActions}>
                <TouchableOpacity 
                  style={[styles.subscriptionButton, { backgroundColor: themeColors.primary }]}
                  onPress={() => router.push('/(app)/subscription-plans')}
                  disabled={subscriptionLoading}
                >
                  <MaterialIcons name="star" size={20} color={themeColors.white} />
                  <Text style={[styles.subscriptionButtonText, { color: themeColors.white }]}>
                    {t('dashboard.upgrade')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : subscriptionDetails.isInTrial ? (
              <View style={styles.subscriptionActions}>
                <TouchableOpacity 
                  style={[
                    styles.subscriptionButton, 
                    { backgroundColor: themeColors.primary },
                    subscriptionLoading && styles.disabledButton
                  ]}
                  onPress={() => router.push('/(app)/subscription-plans')}
                  disabled={subscriptionLoading}
                >
                  <MaterialIcons name="payments" size={20} color={themeColors.white} />
                  <Text style={[styles.subscriptionButtonText, { color: themeColors.white }]}>
                    {t('subscription.subscribeMontly')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.subscriptionButton, 
                    styles.secondaryButton, 
                    { backgroundColor: themeColors.surfaceVariant },
                    subscriptionLoading && styles.disabledButton
                  ]}
                  onPress={() => router.push('/(app)/subscription-plans')}
                  disabled={subscriptionLoading}
                >
                  <MaterialIcons name="calendar-today" size={20} color={themeColors.primary} />
                  <Text style={[styles.subscriptionButtonText, { color: themeColors.primary }]}>
                    {t('subscription.subscribeYearly')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.subscriptionButton, 
                    styles.cancelButton, 
                    { backgroundColor: themeColors.surfaceVariant },
                    subscriptionLoading && styles.disabledButton
                  ]}
                  onPress={handleCancelSubscription}
                  disabled={subscriptionLoading}
                >
                  <Text style={[styles.cancelButtonText, { color: themeColors.error }]}>
                    {t('subscription.cancelTrial')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.subscriptionActions}>
                <TouchableOpacity 
                  style={[
                    styles.subscriptionButton, 
                    styles.cancelButton, 
                    { backgroundColor: themeColors.surfaceVariant },
                    subscriptionLoading && styles.disabledButton
                  ]}
                  onPress={handleCancelSubscription}
                  disabled={subscriptionLoading}
                >
                  <Text style={[styles.cancelButtonText, { color: themeColors.error }]}>
                    {t('subscription.cancelSubscription')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        
        <View style={[styles.section, { 
          backgroundColor: themeColors.surface,
          shadowColor: themeColors.primary
        }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            {t('profile.settings')}
          </Text>
          
          {/* Theme Mode Setting */}
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: themeColors.border }]}
            onPress={navigateToDarkModeSettings}
          >
            <View style={styles.settingLabelContainer}>
              <MaterialIcons name="brightness-4" size={24} color={themeColors.text} />
              <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                {t('profile.appearance')}
              </Text>
            </View>
            <View style={styles.themeValueContainer}>
              <Text style={[styles.themeValue, { color: themeColors.textSecondary }]}>
                {themeMode === 'system' 
                  ? t('profile.systemDefault') 
                  : themeMode === 'light' 
                    ? t('profile.lightMode') 
                    : t('profile.darkMode')}
              </Text>
              <MaterialIcons name="chevron-right" size={24} color={themeColors.textSecondary} />
            </View>
          </TouchableOpacity>

          {/* Language Setting */}
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: themeColors.border, borderBottomWidth: 0 }]}
            onPress={navigateToLanguageSettings}
          >
            <View style={styles.settingLabelContainer}>
              <MaterialIcons name="language" size={24} color={themeColors.text} />
              <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                {t('profile.language')}
              </Text>
            </View>
            <View style={styles.themeValueContainer}>
              <Text style={[styles.themeValue, { color: themeColors.textSecondary }]}>
                {LANGUAGES.find((lang: { code: string; name: string; nativeName: string }) => lang.code === language)?.name || 'English'}
              </Text>
              <MaterialIcons name="chevron-right" size={24} color={themeColors.textSecondary} />
            </View>
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
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: themeColors.border }]}
            onPress={navigateToChangePassword}
          >
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
          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: themeColors.border, borderBottomWidth: 0 }]}>
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
    justifyContent: 'space-between',
    height: 60,
    position: 'relative',
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
    marginBottom: 8,
  },
  subscriptionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  subscriptionText: {
    fontSize: 10,
    fontWeight: 'bold',
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
  themeValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeValue: {
    fontSize: 14,
    marginRight: 4,
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
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  subscriptionInfo: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  subscriptionDetail: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  subscriptionLabel: {
    width: 90,
    fontSize: 14,
  },
  subscriptionValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  subscriptionActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  subscriptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cancelButton: {
    marginTop: 8,
  },
  subscriptionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  inlineLoader: {
    marginLeft: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
}); 