const User = require('../models/User');

// Pricing constants
const PRICING = {
  MONTHLY: 9.99,
  YEARLY: 99.99,
  TRIAL_DAYS: 7
};

/**
 * Start a free trial for a user
 * @param {string} userId - User ID
 */
const startFreeTrial = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Check if user is already on premium or has had a trial before
  if (user.subscription.plan === 'premium') {
    throw new Error('User is already on a premium plan');
  }
  
  if (user.subscription.trialStartDate) {
    throw new Error('User has already used their free trial');
  }
  
  const now = new Date();
  const trialEndDate = new Date(now.getTime() + PRICING.TRIAL_DAYS * 24 * 60 * 60 * 1000);
  
  user.subscription.plan = 'premium';
  user.subscription.isInTrial = true;
  user.subscription.trialStartDate = now;
  user.subscription.trialEndDate = trialEndDate;
  user.subscription.documentLimitTotal = 50; // Premium document limit
  
  await user.save();
  
  return {
    message: 'Free trial started successfully',
    subscription: user.subscription
  };
};

/**
 * Subscribe user to a premium plan
 * @param {string} userId - User ID
 * @param {string} billingCycle - 'monthly' or 'yearly'
 */
const subscribeToPremium = async (userId, billingCycle) => {
  if (billingCycle !== 'monthly' && billingCycle !== 'yearly') {
    throw new Error('Invalid billing cycle');
  }
  
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const now = new Date();
  let nextBillingDate;
  
  if (billingCycle === 'monthly') {
    nextBillingDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  } else { // yearly
    nextBillingDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  }
  
  user.subscription.plan = 'premium';
  user.subscription.billingCycle = billingCycle;
  user.subscription.isInTrial = false;
  user.subscription.lastBillingDate = now;
  user.subscription.nextBillingDate = nextBillingDate;
  user.subscription.documentLimitTotal = 50; // Premium document limit
  
  await user.save();
  
  return {
    message: `Successfully subscribed to premium (${billingCycle})`,
    subscription: user.subscription
  };
};

/**
 * Cancel a premium subscription
 * @param {string} userId - User ID
 */
const cancelSubscription = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  if (user.subscription.plan !== 'premium') {
    throw new Error('User is not on a premium plan');
  }
  
  // If user is in trial, end trial immediately but keep trialStartDate
  // so they can't start another free trial
  if (user.subscription.isInTrial) {
    user.subscription.isInTrial = false;
    user.subscription.plan = 'free';
    // We keep trialStartDate to track that they've had a trial before
  } else {
    // For paid subscriptions, service continues until next billing date
    // We'll mark it to not renew
    user.subscription.billingCycle = 'none';
    // In a real app, you might set a flag to indicate the subscription should be cancelled at the next billing date
  }
  
  await user.save();
  
  return {
    message: 'Subscription cancelled successfully',
    subscription: user.subscription
  };
};

/**
 * Get subscription details for a user
 * @param {string} userId - User ID
 */
const getSubscriptionDetails = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Update document limits based on plan and reset dates
  user.updateDocumentLimit();
  await user.save();
  
  // Calculate remaining documents
  const remainingDocuments = user.subscription.documentLimitTotal - user.subscription.documentLimitUsed;
  
  // Check if subscription has been canceled but is still active
  // This happens when billingCycle is 'none' but plan is still 'premium'
  const isCanceledButActive = user.subscription.plan === 'premium' && user.subscription.billingCycle === 'none';
  
  return {
    plan: user.subscription.plan,
    billingCycle: user.subscription.billingCycle,
    isInTrial: user.subscription.isInTrial,
    trialEndDate: user.subscription.trialEndDate,
    nextBillingDate: user.subscription.nextBillingDate,
    documentLimitTotal: user.subscription.documentLimitTotal,
    documentLimitUsed: user.subscription.documentLimitUsed,
    documentLimitRemaining: remainingDocuments,
    resetDate: user.subscription.documentLimitResetDate,
    isCanceledButActive,
    pricing: {
      monthly: PRICING.MONTHLY,
      yearly: PRICING.YEARLY
    }
  };
};

/**
 * Check if a user can process a document
 * @param {string} userId - User ID
 */
const canProcessDocument = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Update document limits in case reset date has passed
  user.updateDocumentLimit();
  
  const canProcess = user.canProcessDocument();
  const remainingDocuments = user.subscription.documentLimitTotal - user.subscription.documentLimitUsed;
  
  await user.save();
  
  return {
    canProcess,
    remainingDocuments,
    plan: user.subscription.plan,
    usedDocuments: user.subscription.documentLimitUsed,
    totalDocuments: user.subscription.documentLimitTotal
  };
};

/**
 * Increment document count for a user
 * @param {string} userId - User ID
 */
const incrementDocumentCount = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // First check if user can process document
  if (!user.canProcessDocument()) {
    throw new Error('Document limit reached');
  }
  
  user.incrementDocumentCount();
  await user.save();
  
  const remainingDocuments = user.subscription.documentLimitTotal - user.subscription.documentLimitUsed;
  
  return {
    remainingDocuments,
    usedDocuments: user.subscription.documentLimitUsed,
    totalDocuments: user.subscription.documentLimitTotal
  };
};

module.exports = {
  startFreeTrial,
  subscribeToPremium,
  cancelSubscription,
  getSubscriptionDetails,
  canProcessDocument,
  incrementDocumentCount,
  PRICING
}; 