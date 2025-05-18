import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from '../utils/i18n';
import useThemeColors from '../utils/useThemeColors';
import subscriptionService from '../services/subscriptionService';
import { SubscriptionDetails } from '../types/auth.types';
import { PurchasesPackage } from 'react-native-purchases';
import { useAuth } from '../hooks/useAuth';

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
        'Success',
        `You have successfully subscribed to the ${billingCycle} premium plan!`,
        [{ text: 'OK', onPress: () => router.replace('/(app)/dashboard') }]
      );
    } catch (error: any) {
      if (error.message === 'Purchase cancelled') {
        // User cancelled, no need to show an error
        console.log('User cancelled purchase');
      } else {
        Alert.alert('Error', error.message || 'Failed to subscribe to premium');
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
        'Restore Complete',
        result.message,
        [{ text: 'OK', onPress: () => router.replace('/(app)/dashboard') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to restore purchases');
    } finally {
      setRestoring(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      setSubscribing(true);
      await subscriptionService.reactivateSubscription();
      Alert.alert(
        'Subscription Reactivated',
        'Your subscription has been successfully reactivated.',
        [{ text: 'OK', onPress: () => router.replace('/(app)/dashboard') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to reactivate subscription');
    } finally {
      setSubscribing(false);
    }
  };

  const handleStartTrial = async () => {
    try {
      setSubscribing(true);
      await subscriptionService.startFreeTrial();
      Alert.alert(
        'Free Trial Started',
        'You have successfully started your 7-day free trial of premium features!',
        [{ text: 'OK', onPress: () => router.replace('/(app)/dashboard') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start free trial');
    } finally {
      setSubscribing(false);
    }
  };

  const renderFeatureItem = (text: string, included: boolean) => (
    <View style={styles.featureItem}>
      <MaterialIcons 
        name={included ? "check-circle" : "cancel"} 
        size={20} 
        color={included ? themeColors.primary : themeColors.error} 
      />
      <Text style={[styles.featureText, { color: themeColors.text }]}>{text}</Text>
    </View>
  );

  const renderContent = () => {
    if (!subscriptionDetails) {
      return null;
    }

    const savingsPercent = Math.round(100 - (subscriptionDetails.pricing.yearly / 12 / subscriptionDetails.pricing.monthly * 100));

    // If the user is already on a premium plan, show a plan change interface
    if (subscriptionDetails.plan === 'premium' && !subscriptionDetails.isInTrial && !subscriptionDetails.isCanceledButActive) {
      return (
        <View style={styles.contentContainer}>
          <Text style={[styles.pageTitle, { color: themeColors.text }]}>{t('subscription.changePlan')}</Text>
          <Text style={[styles.pageSubtitle, { color: themeColors.textSecondary }]}>
            {t('subscription.billing')}: {subscriptionDetails.billingCycle === 'monthly' ? t('subscription.monthly') : t('subscription.yearly')}
          </Text>
          
          {/* Current plan */}
          <View style={[styles.planCard, { 
            backgroundColor: themeColors.surface, 
            borderColor: subscriptionDetails.billingCycle === 'monthly' ? themeColors.primary : 'rgba(0,0,0,0.05)',
            borderWidth: subscriptionDetails.billingCycle === 'monthly' ? 2 : 1
          }]}>
            {subscriptionDetails.billingCycle === 'monthly' && (
              <View style={[styles.currentPlanBadge, { backgroundColor: themeColors.primary }]}>
                <Text style={[styles.currentPlanText, { color: themeColors.white }]}>{t('subscription.current')}</Text>
              </View>
            )}
            <View style={styles.planHeader}>
              <Text style={[styles.planTitle, { color: themeColors.text }]}>{t('subscription.monthly')} {t('subscription.premium')}</Text>
              <Text style={[styles.planPrice, { color: themeColors.primary }]}>${subscriptionDetails.pricing.monthly}</Text>
              <Text style={[styles.perPeriod, { color: themeColors.textSecondary }]}>{t('subscription.monthly').toLowerCase()}</Text>
            </View>
            <View style={styles.featureList}>
              {renderFeatureItem("50 documents per month", true)}
              {renderFeatureItem("Priority OCR processing", true)}
              {renderFeatureItem("Cancel anytime", true)}
            </View>
            
            {subscriptionDetails.billingCycle !== 'monthly' && (
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: themeColors.primary }]}
                onPress={() => handleSubscribe('monthly')}
                disabled={subscribing}
              >
                {subscribing ? (
                  <ActivityIndicator size="small" color={themeColors.white} />
                ) : (
                  <Text style={[styles.actionButtonText, { color: themeColors.white }]}>{t('subscription.switchToMonthly')}</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Yearly plan */}
          <View style={[styles.planCard, { 
            backgroundColor: themeColors.surface,
            borderColor: subscriptionDetails.billingCycle === 'yearly' ? themeColors.primary : 'rgba(0,0,0,0.05)',
            borderWidth: subscriptionDetails.billingCycle === 'yearly' ? 2 : 1
          }]}>
            <View style={[styles.bestValueTag, { backgroundColor: themeColors.primary }]}>
              <Text style={[styles.bestValueText, { color: themeColors.white }]}>BEST VALUE</Text>
            </View>
            
            {subscriptionDetails.billingCycle === 'yearly' && (
              <View style={[styles.currentPlanBadge, { backgroundColor: themeColors.primary }]}>
                <Text style={[styles.currentPlanText, { color: themeColors.white }]}>{t('subscription.current')}</Text>
              </View>
            )}
            
            <View style={styles.planHeader}>
              <Text style={[styles.planTitle, { color: themeColors.text }]}>{t('subscription.yearly')} {t('subscription.premium')}</Text>
              <Text style={[styles.planPrice, { color: themeColors.primary }]}>${subscriptionDetails.pricing.yearly}</Text>
              <Text style={[styles.perPeriod, { color: themeColors.textSecondary }]}>{t('subscription.yearly').toLowerCase()}</Text>
            </View>
            <Text style={[styles.planDescription, { color: themeColors.textSecondary }]}>
              {t('common.save')} {savingsPercent}% {t('common.and')} ${Math.round(subscriptionDetails.pricing.monthly * 12 - subscriptionDetails.pricing.yearly)}
            </Text>
            <View style={styles.featureList}>
              {renderFeatureItem("50 documents per month", true)}
              {renderFeatureItem("Priority OCR processing", true)}
              {renderFeatureItem("Cancel anytime", true)}
              {renderFeatureItem(`Save ${savingsPercent}% compared to monthly plan`, true)}
            </View>
            
            {subscriptionDetails.billingCycle !== 'yearly' && (
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: themeColors.primary }]}
                onPress={() => handleSubscribe('yearly')}
                disabled={subscribing}
              >
                {subscribing ? (
                  <ActivityIndicator size="small" color={themeColors.white} />
                ) : (
                  <Text style={[styles.actionButtonText, { color: themeColors.white }]}>{t('subscription.switchToYearly')}</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: themeColors.surfaceVariant, marginTop: 20, marginBottom: 8 }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.actionButtonText, { color: themeColors.text }]}>{t('common.cancel')}</Text>
          </TouchableOpacity>
          
          {(Platform.OS === 'ios' || Platform.OS === 'android') && (
            <TouchableOpacity 
              style={[styles.restoreButton, { borderColor: themeColors.border }]}
              onPress={handleRestorePurchases}
              disabled={restoring}
            >
              {restoring ? (
                <ActivityIndicator size="small" color={themeColors.primary} />
              ) : (
                <Text style={[styles.restoreButtonText, { color: themeColors.primary }]}>
                  {t('subscription.restore')}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      );
    }
    
    // If the subscription is canceled but still active, show the original reactivation view
    if (subscriptionDetails.isCanceledButActive) {
      return (
        <View style={styles.contentContainer}>
          <Text style={[styles.pageTitle, { color: themeColors.text }]}>Your Subscription</Text>
          <Text style={[styles.pageSubtitle, { color: themeColors.textSecondary }]}>
            Your premium subscription has been canceled but remains active until your next billing date.
          </Text>
          
          <View style={[styles.planCard, { backgroundColor: themeColors.surface, borderColor: themeColors.primary, borderWidth: 2 }]}>
            <View style={styles.planHeader}>
              <Text style={[styles.planTitle, { color: themeColors.text }]}>Premium Plan (Ending)</Text>
              <Text style={[styles.planDescription, { color: themeColors.textSecondary }]}>
                Active until: {subscriptionDetails.nextBillingDate 
                  ? new Date(subscriptionDetails.nextBillingDate).toLocaleDateString() 
                  : 'Unknown'}
              </Text>
            </View>
            <View style={styles.featureList}>
              {renderFeatureItem("50 documents per month", true)}
              {renderFeatureItem("Priority OCR processing", true)}
            </View>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: themeColors.primary }]}
              onPress={handleReactivateSubscription}
              disabled={subscribing}
            >
              {subscribing ? (
                <ActivityIndicator size="small" color={themeColors.white} />
              ) : (
                <Text style={[styles.actionButtonText, { color: themeColors.white }]}>Reactivate Subscription</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: themeColors.surfaceVariant, marginTop: 20 }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.actionButtonText, { color: themeColors.text }]}>Return to Dashboard</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Default content for non-premium users or when showing plans is appropriate
    return (
      <View style={styles.contentContainer}>
        <Text style={[styles.pageTitle, { color: themeColors.text }]}>Premium Plans</Text>
        <Text style={[styles.pageSubtitle, { color: themeColors.textSecondary }]}>Choose the plan that suits your needs</Text>
        
        {!subscriptionDetails.trialStartDate && (
          <View style={[styles.planCard, { backgroundColor: themeColors.surface, borderColor: themeColors.primary }]}>
            <View style={styles.planHeader}>
              <Text style={[styles.planTitle, { color: themeColors.text }]}>Free 7-Day Trial</Text>
              <Text style={[styles.planPrice, { color: themeColors.primary }]}>$0.00</Text>
            </View>
            <Text style={[styles.planDescription, { color: themeColors.textSecondary }]}>Try all premium features free for 7 days</Text>
            <View style={styles.featureList}>
              {renderFeatureItem("50 documents per month", true)}
              {renderFeatureItem("Priority OCR processing", true)}
              {renderFeatureItem("Cancel anytime", true)}
            </View>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: themeColors.primary }]}
              onPress={handleStartTrial}
              disabled={subscribing}
            >
              {subscribing ? (
                <ActivityIndicator size="small" color={themeColors.white} />
              ) : (
                <Text style={[styles.actionButtonText, { color: themeColors.white }]}>Start Free Trial</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.planCard, { backgroundColor: themeColors.surface }]}>
          <View style={styles.planHeader}>
            <Text style={[styles.planTitle, { color: themeColors.text }]}>Monthly Premium</Text>
            <Text style={[styles.planPrice, { color: themeColors.primary }]}>${subscriptionDetails.pricing.monthly}</Text>
            <Text style={[styles.perPeriod, { color: themeColors.textSecondary }]}>per month</Text>
          </View>
          <Text style={[styles.planDescription, { color: themeColors.textSecondary }]}>Pay monthly with flexibility</Text>
          <View style={styles.featureList}>
            {renderFeatureItem("50 documents per month", true)}
            {renderFeatureItem("Priority OCR processing", true)}
            {renderFeatureItem("Cancel anytime", true)}
          </View>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: themeColors.primary }]}
            onPress={() => handleSubscribe('monthly')}
            disabled={subscribing}
          >
            {subscribing ? (
              <ActivityIndicator size="small" color={themeColors.white} />
            ) : (
              <Text style={[styles.actionButtonText, { color: themeColors.white }]}>Subscribe Monthly</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.planCard, { backgroundColor: themeColors.surface, borderColor: themeColors.primary, borderWidth: 2 }]}>
          <View style={[styles.bestValueTag, { backgroundColor: themeColors.primary }]}>
            <Text style={[styles.bestValueText, { color: themeColors.white }]}>BEST VALUE</Text>
          </View>
          <View style={styles.planHeader}>
            <Text style={[styles.planTitle, { color: themeColors.text }]}>Yearly Premium</Text>
            <Text style={[styles.planPrice, { color: themeColors.primary }]}>${subscriptionDetails.pricing.yearly}</Text>
            <Text style={[styles.perPeriod, { color: themeColors.textSecondary }]}>per year</Text>
          </View>
          <Text style={[styles.planDescription, { color: themeColors.textSecondary }]}>
            Save {savingsPercent}% compared to monthly plan
          </Text>
          <View style={styles.featureList}>
            {renderFeatureItem("50 documents per month", true)}
            {renderFeatureItem("Priority OCR processing", true)}
            {renderFeatureItem("All future premium features", true)}
            {renderFeatureItem("Save " + savingsPercent + "% compared to monthly plan", true)}
          </View>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: themeColors.primary }]}
            onPress={() => handleSubscribe('yearly')}
            disabled={subscribing}
          >
            {subscribing ? (
              <ActivityIndicator size="small" color={themeColors.white} />
            ) : (
              <Text style={[styles.actionButtonText, { color: themeColors.white }]}>Subscribe Yearly</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.planCard, { backgroundColor: themeColors.surface, marginBottom: 20 }]}>
          <View style={styles.planHeader}>
            <Text style={[styles.planTitle, { color: themeColors.text }]}>Free Plan</Text>
            <Text style={[styles.planPrice, { color: themeColors.primary }]}>$0.00</Text>
          </View>
          <Text style={[styles.planDescription, { color: themeColors.textSecondary }]}>Limited features at no cost</Text>
          <View style={styles.featureList}>
            {renderFeatureItem("5 documents per week", true)}
            {renderFeatureItem("Standard OCR processing", true)}
            {renderFeatureItem("Priority OCR processing", false)}
            {renderFeatureItem("Additional premium features", false)}
          </View>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: themeColors.surfaceVariant }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.actionButtonText, { color: themeColors.text }]}>Continue with Free Plan</Text>
          </TouchableOpacity>
        </View>
        
        <View style={{ height: 40 }} /> {/* Bottom padding */}
      </View>
    );
  };

  if (loading || !subscriptionDetails) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: themeColors.background }]} edges={['top']}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>Loading subscription plans...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>Choose Your Plan</Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView style={styles.content}>
        {renderContent()}
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
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    padding: 8,
  },
  placeholderButton: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  planCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  bestValueTag: {
    position: 'absolute',
    top: -12,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bestValueText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    marginBottom: 16,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  perPeriod: {
    fontSize: 14,
    marginTop: 4,
  },
  planDescription: {
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 20,
  },
  featureList: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    marginLeft: 10,
    fontSize: 14,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  restoreButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 20,
    marginBottom: 20,
  },
  restoreButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  currentPlanBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  currentPlanText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 