import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, ScrollView, Alert, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from '../utils/i18n';
import useThemeColors from '../utils/useThemeColors';
import subscriptionService from '../services/subscriptionService';
import { SubscriptionDetails } from '../types/auth.types';
import { PurchasesPackage } from 'react-native-purchases';
import { useAuth } from '../hooks/useAuth';

const { width: screenWidth } = Dimensions.get('window');

export default function SubscriptionPlans() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const themeColors = useThemeColors();
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Initialize purchases if on mobile
        if ((Platform.OS === 'ios' || Platform.OS === 'android') && user?._id) {
          await subscriptionService.initializePurchases(user._id);
          const availablePackages = await subscriptionService.getAvailablePackages();
          setPackages(availablePackages);
          console.log(`Found ${availablePackages.length} subscription packages`);
        }
        
        // Get subscription details
        const details = await subscriptionService.getSubscriptionDetails();
        setSubscriptionDetails(details);
      } catch (error) {
        console.error('Error initializing subscription data:', error);
        Alert.alert('Error', 'Failed to load subscription details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [user]);

  const handleSubscribe = async (billingCycle: 'monthly' | 'yearly') => {
    try {
      setSubscribing(true);
      await subscriptionService.subscribeToPremium(billingCycle);
      Alert.alert(
        t('common.success'),
        t(billingCycle === 'monthly' ? 'subscription.subscribeMontly' : 'subscription.subscribeYearly'),
        [{ text: t('common.ok'), onPress: () => router.replace('/(app)/dashboard') }]
      );
    } catch (error: any) {
      if (error.message === 'Purchase cancelled') {
        console.log('User cancelled purchase');
      } else {
        Alert.alert(t('common.error'), error.message || t('profile.updateFailed'));
      }
    } finally {
      setSubscribing(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setRestoring(true);
      const result = await subscriptionService.restorePurchases();
      Alert.alert(
        t('common.success'),
        result.message,
        [{ text: t('common.ok'), onPress: () => router.replace('/(app)/dashboard') }]
      );
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('profile.updateFailed'));
    } finally {
      setRestoring(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      setSubscribing(true);
      await subscriptionService.reactivateSubscription();
      Alert.alert(
        t('common.success'),
        t('subscription.reactivate'),
        [{ text: t('common.ok'), onPress: () => router.replace('/(app)/dashboard') }]
      );
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('profile.updateFailed'));
    } finally {
      setSubscribing(false);
    }
  };

  const handleStartTrial = async () => {
    try {
      setSubscribing(true);
      await subscriptionService.startFreeTrial();
      Alert.alert(
        t('common.success'),
        t('subscription.startFreeTrial'),
        [{ text: t('common.ok'), onPress: () => router.replace('/(app)/dashboard') }]
      );
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('profile.updateFailed'));
    } finally {
      setSubscribing(false);
    }
  };

  const renderFeatureItem = (text: string, included: boolean) => (
    <View style={styles.featureItem}>
      <View style={[
        styles.featureIconContainer,
        { backgroundColor: included ? themeColors.primary + '20' : themeColors.error + '20' }
      ]}>
        <MaterialIcons 
          name={included ? "check" : "close"} 
          size={16} 
          color={included ? themeColors.primary : themeColors.error} 
        />
      </View>
      <Text style={[styles.featureText, { color: themeColors.text }]}>{text}</Text>
    </View>
  );

  const PlanCard = ({ 
    title, 
    price, 
    period, 
    description, 
    features, 
    onPress, 
    loading, 
    buttonText, 
    isRecommended = false,
    isCurrentPlan = false,
    gradientColors = [themeColors.surface, themeColors.surface],
    borderColor = themeColors.border
  }: {
    title: string;
    price: string | number;
    period?: string;
    description?: string;
    features: Array<{ text: string; included: boolean }>;
    onPress?: () => void;
    loading?: boolean;
    buttonText?: string;
    isRecommended?: boolean;
    isCurrentPlan?: boolean;
    gradientColors?: [string, string];
    borderColor?: string;
  }) => (
    <View style={[styles.planCardContainer, { borderColor }]}>
      <LinearGradient
        colors={gradientColors}
        style={styles.planCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {isRecommended && (
          <View style={[styles.recommendedBadge, { backgroundColor: themeColors.primary }]}>
            <MaterialIcons name="star" size={16} color={themeColors.white} />
            <Text style={[styles.recommendedText, { color: themeColors.white }]}>
              {t('subscription.recommended')}
            </Text>
          </View>
        )}
        
        {isCurrentPlan && (
          <View style={[styles.currentPlanBadge, { backgroundColor: themeColors.success }]}>
            <MaterialIcons name="check-circle" size={16} color={themeColors.white} />
            <Text style={[styles.currentPlanText, { color: themeColors.white }]}>
              {t('subscription.current')}
            </Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <Text style={[styles.planTitle, { color: themeColors.text }]}>{title}</Text>
          <View style={styles.priceContainer}>
            <Text style={[styles.planPrice, { color: themeColors.primary }]}>
              <Text style={styles.currencySymbol}>$</Text>
              <Text>{price}</Text>
            </Text>
            {period && (
              <Text style={[styles.pricePeriod, { color: themeColors.textSecondary }]}>
                <Text>/{period}</Text>
              </Text>
            )}
          </View>
          {description && (
            <Text style={[styles.planDescription, { color: themeColors.textSecondary }]}>
              {description}
            </Text>
          )}
        </View>

        <View style={styles.featureList}>
          {features.map((feature, index) => (
            <View key={index}>
              {renderFeatureItem(feature.text, feature.included)}
            </View>
          ))}
        </View>

        {onPress && buttonText && (
          <TouchableOpacity 
            style={[
              styles.planButton,
              { backgroundColor: isRecommended ? themeColors.primary : themeColors.surfaceVariant }
            ]}
            onPress={onPress}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator 
                size="small" 
                color={isRecommended ? themeColors.white : themeColors.primary} 
              />
            ) : (
              <Text style={[
                styles.planButtonText, 
                { color: isRecommended ? themeColors.white : themeColors.primary }
              ]}>
                {buttonText}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
  );

  const renderContent = () => {
    if (!subscriptionDetails) {
      return null;
    }

    const savingsPercent = Math.round(100 - (subscriptionDetails.pricing.yearly / 12 / subscriptionDetails.pricing.monthly * 100));

    // Premium user with active subscription
    if (subscriptionDetails.plan === 'premium' && !subscriptionDetails.isInTrial && !subscriptionDetails.isCanceledButActive) {
      return (
        <View style={styles.contentContainer}>
          <View style={styles.headerSection}>
            <LinearGradient
              colors={[themeColors.primary + '20', themeColors.primaryLight + '10']}
              style={styles.headerGradient}
            >
              <MaterialIcons name="workspace-premium" size={48} color={themeColors.primary} />
              <Text style={[styles.pageTitle, { color: themeColors.text }]}>
                {t('subscription.managePlan')}
              </Text>
              <Text style={[styles.pageSubtitle, { color: themeColors.textSecondary }]}>
                <Text>{t('subscription.billing')}: </Text>
                <Text style={{ color: themeColors.primary, fontWeight: '600' }}>
                  {subscriptionDetails.billingCycle === 'monthly' ? t('subscription.monthly') : t('subscription.yearly')}
                </Text>
              </Text>
            </LinearGradient>
          </View>

          <PlanCard
            title={`${t('subscription.monthly')} ${t('subscription.premium')}`}
            price={subscriptionDetails.pricing.monthly}
            period={t('subscription.monthly').toLowerCase()}
            features={[
              { text: t('subscription.feature.documents'), included: true },
              { text: t('subscription.feature.priority'), included: true },
              { text: t('subscription.feature.cancel'), included: true }
            ]}
            onPress={subscriptionDetails.billingCycle !== 'monthly' ? () => handleSubscribe('monthly') : undefined}
            loading={subscribing}
            buttonText={subscriptionDetails.billingCycle !== 'monthly' ? t('subscription.switchToMonthly') : undefined}
            isCurrentPlan={subscriptionDetails.billingCycle === 'monthly'}
            borderColor={subscriptionDetails.billingCycle === 'monthly' ? themeColors.primary : themeColors.border}
            gradientColors={subscriptionDetails.billingCycle === 'monthly' ? 
              [themeColors.primary + '10', themeColors.surface] : 
              [themeColors.surface, themeColors.surface]
            }
          />

          <PlanCard
            title={`${t('subscription.yearly')} ${t('subscription.premium')}`}
            price={subscriptionDetails.pricing.yearly}
            period={t('subscription.yearly').toLowerCase()}
            description={`${t('common.save')} ${savingsPercent}% - $${Math.round(subscriptionDetails.pricing.monthly * 12 - subscriptionDetails.pricing.yearly)} ${t('common.annually')}`}
            features={[
              { text: t('subscription.feature.documents'), included: true },
              { text: t('subscription.feature.priority'), included: true },
              { text: t('subscription.feature.cancel'), included: true },
              { text: t('subscription.feature.savings'), included: true }
            ]}
            onPress={subscriptionDetails.billingCycle !== 'yearly' ? () => handleSubscribe('yearly') : undefined}
            loading={subscribing}
            buttonText={subscriptionDetails.billingCycle !== 'yearly' ? t('subscription.switchToYearly') : undefined}
            isRecommended={subscriptionDetails.billingCycle !== 'yearly'}
            isCurrentPlan={subscriptionDetails.billingCycle === 'yearly'}
            borderColor={subscriptionDetails.billingCycle === 'yearly' ? themeColors.primary : themeColors.border}
            gradientColors={subscriptionDetails.billingCycle === 'yearly' ? 
              [themeColors.primary + '10', themeColors.surface] : 
              [themeColors.primaryLight + '05', themeColors.surface]
            }
          />
        </View>
      );
    }

    // Cancelled subscription
    if (subscriptionDetails.isCanceledButActive) {
      return (
        <View style={styles.contentContainer}>
          <View style={styles.headerSection}>
            <LinearGradient
              colors={[themeColors.warning + '20', themeColors.warning + '05']}
              style={styles.headerGradient}
            >
              <MaterialIcons name="warning" size={48} color={themeColors.warning} />
              <Text style={[styles.pageTitle, { color: themeColors.text }]}>
                {t('subscription.subscriptionEnding')}
              </Text>
              <Text style={[styles.pageSubtitle, { color: themeColors.textSecondary }]}>
                <Text>{t('subscription.accessUntil')}: </Text>
                <Text style={{ color: themeColors.warning, fontWeight: '600' }}>
                  {subscriptionDetails.nextBillingDate 
                    ? new Date(subscriptionDetails.nextBillingDate).toLocaleDateString() 
                    : "Unknown"}
                </Text>
              </Text>
            </LinearGradient>
          </View>

          <PlanCard
            title={`${t('subscription.premium')} (${t('subscription.subscriptionEnding')})`}
            price="Active"
            description={`${t('subscription.nextBilling')}: ${subscriptionDetails.nextBillingDate 
              ? new Date(subscriptionDetails.nextBillingDate).toLocaleDateString() 
              : "Unknown"}`}
            features={[
              { text: t('subscription.feature.documents'), included: true },
              { text: t('subscription.feature.priority'), included: true }
            ]}
            onPress={handleReactivateSubscription}
            loading={subscribing}
            buttonText={t('subscription.reactivate')}
            isRecommended={true}
            borderColor={themeColors.warning}
            gradientColors={[themeColors.warning + '10', themeColors.surface]}
          />
        </View>
      );
    }

    // Default subscription plans view
    return (
      <View style={styles.contentContainer}>
        <View style={styles.headerSection}>
          <LinearGradient
            colors={[themeColors.primary + '15', themeColors.primaryLight + '05']}
            style={styles.headerGradient}
          >
            <MaterialIcons name="rocket-launch" size={48} color={themeColors.primary} />
            <Text style={[styles.pageTitle, { color: themeColors.text }]}>
              {t('subscription.title')}
            </Text>
            <Text style={[styles.pageSubtitle, { color: themeColors.textSecondary }]}>
              {t('subscription.chooseYourPlan')}
            </Text>
          </LinearGradient>
        </View>

        {!subscriptionDetails.trialStartDate && (
          <PlanCard
            title={t('subscription.trial')}
            price="0"
            period={t('subscription.days7')}
            description={t('subscription.trialDescription')}
            features={[
              { text: t('subscription.feature.documents'), included: true },
              { text: t('subscription.feature.priority'), included: true },
              { text: t('subscription.feature.cancel'), included: true }
            ]}
            onPress={handleStartTrial}
            loading={subscribing}
            buttonText={t('subscription.startFreeTrial')}
            isRecommended={true}
            borderColor={themeColors.success}
            gradientColors={[themeColors.success + '10', themeColors.surface]}
          />
        )}

        <PlanCard
          title={`${t('subscription.monthly')} ${t('subscription.premium')}`}
          price={subscriptionDetails.pricing.monthly}
          period={t('subscription.monthly').toLowerCase()}
          description={t('subscription.monthlyDescription')}
          features={[
            { text: t('subscription.feature.documents'), included: true },
            { text: t('subscription.feature.priority'), included: true },
            { text: t('subscription.feature.cancel'), included: true }
          ]}
          onPress={() => handleSubscribe('monthly')}
          loading={subscribing}
          buttonText={t('subscription.subscribeMontly')}
          borderColor={themeColors.border}
          gradientColors={[themeColors.surface, themeColors.surface]}
        />

        <PlanCard
          title={`${t('subscription.yearly')} ${t('subscription.premium')}`}
          price={subscriptionDetails.pricing.yearly}
          period={t('subscription.yearly').toLowerCase()}
          description={`${t('subscription.yearlyDescription')} - ${t('common.save')} ${savingsPercent}%!`}
          features={[
            { text: t('subscription.feature.documents'), included: true },
            { text: t('subscription.feature.priority'), included: true },
            { text: t('subscription.feature.cancel'), included: true },
            { text: t('subscription.feature.savings'), included: true }
          ]}
          onPress={() => handleSubscribe('yearly')}
          loading={subscribing}
          buttonText={t('subscription.subscribeYearly')}
          isRecommended={true}
          borderColor={themeColors.primary}
          gradientColors={[themeColors.primary + '10', themeColors.surface]}
        />

        <PlanCard
          title={t('subscription.free')}
          price="0"
          description={t('subscription.freeDescription')}
          features={[
            { text: t('subscription.feature.documentsWeekly'), included: true },
            { text: t('subscription.feature.standard'), included: true },
            { text: t('subscription.feature.priority'), included: false },
            { text: t('subscription.feature.premium'), included: false }
          ]}
          onPress={() => router.back()}
          buttonText={t('subscription.continueFree')}
          borderColor={themeColors.border}
          gradientColors={[themeColors.surfaceVariant, themeColors.surface]}
        />
      </View>
    );
  };

  if (loading || !subscriptionDetails) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: themeColors.background }]} edges={['top']}>
        <LinearGradient
          colors={[themeColors.primary + '20', themeColors.background]}
          style={styles.loadingContainer}
        >
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
            {t('common.loading')}
          </Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: themeColors.text }]}>
          {t('subscription.title')}
        </Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderContent()}
        
        {(Platform.OS === 'ios' || Platform.OS === 'android') && (
          <View style={styles.restoreSection}>
            <TouchableOpacity 
              style={[styles.restoreButton, { borderColor: themeColors.border }]}
              onPress={handleRestorePurchases}
              disabled={restoring}
            >
              {restoring ? (
                <ActivityIndicator size="small" color={themeColors.primary} />
              ) : (
                <>
                  <MaterialIcons name="restore" size={20} color={themeColors.primary} />
                  <Text style={[styles.restoreButtonText, { color: themeColors.primary }]}>
                    {t('subscription.restore')}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    margin: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    zIndex: 1,
  },
  backButton: {
    padding: 8,
    zIndex: 2,
  },
  placeholderButton: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    padding: 20,
  },
  headerSection: {
    marginBottom: 24,
  },
  headerGradient: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    marginBottom: 8,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  planCardContainer: {
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 2,
    overflow: 'hidden',
  },
  planCard: {
    padding: 24,
    position: 'relative',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -1,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  recommendedText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  currentPlanBadge: {
    position: 'absolute',
    top: -1,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  currentPlanText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  planHeader: {
    marginBottom: 20,
  },
  planTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 36,
    fontWeight: '800',
  },
  currencySymbol: {
    fontSize: 24,
  },
  pricePeriod: {
    fontSize: 18,
    marginLeft: 4,
  },
  planDescription: {
    fontSize: 15,
    lineHeight: 20,
    marginTop: 8,
  },
  featureList: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  featureIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  planButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  planButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  restoreSection: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  restoreButtonText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 40,
  },
}); 