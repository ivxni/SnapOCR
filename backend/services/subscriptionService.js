const User = require('../models/User');
const axios = require('axios');
const { APPLE_API_URL, GOOGLE_API_URL } = process.env;

// Pricing constants
const PRICING = {
  MONTHLY: 9.99,
  YEARLY: 99.99,
  TRIAL_DAYS: 7
};

// Apple product IDs for validation
const APPLE_PRODUCT_IDS = {
  MONTHLY: 'com.lynxai.app.premium.monthly',
  YEARLY: 'com.lynxai.app.premium.yearly',
};

// Google product IDs for validation
const GOOGLE_PRODUCT_IDS = {
  MONTHLY: 'com.lynxai.app.premium.monthly',
  YEARLY: 'com.lynxai.app.premium.yearly',
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
 * Verify a purchase receipt from Apple/Google
 * @param {string} userId - User ID
 * @param {string} platform - 'ios' or 'android'
 * @param {string} productIdentifier - Product ID from the store
 * @param {string} billingCycle - 'monthly' or 'yearly'
 * @param {string} transactionId - Transaction ID from the platform
 */
const verifyPurchase = async (userId, platform, productIdentifier, billingCycle, transactionId) => {
  if (billingCycle !== 'monthly' && billingCycle !== 'yearly') {
    throw new Error('Invalid billing cycle');
  }
  
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Validate the receipt with Apple/Google
  let isValid = false;
  let receiptData = null;
  
  if (platform === 'ios') {
    // For Apple
    if (!APPLE_PRODUCT_IDS.MONTHLY && productIdentifier === 'monthly' ||
        !APPLE_PRODUCT_IDS.YEARLY && productIdentifier === 'yearly') {
      throw new Error('Invalid product identifier');
    }
    
    // In a real implementation, you would verify with Apple's servers
    // This is a simplified version for demonstration purposes
    try {
      /* 
      // Real implementation would look like:
      const response = await axios.post(APPLE_API_URL, {
        'receipt-data': receipt,
        'password': 'your-shared-secret'
      });
      
      if (response.data.status === 0) {
        // Receipt is valid
        isValid = true;
        receiptData = response.data;
      }
      */
      
      // For demo, we'll assume it's valid
      isValid = true;
      receiptData = {
        expiresDate: new Date(Date.now() + (billingCycle === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000)
      };
    } catch (error) {
      throw new Error(`Failed to verify Apple receipt: ${error.message}`);
    }
  } else if (platform === 'android') {
    // For Google
    // Similar to Apple, you would verify with Google's servers
    // For demo, we'll assume it's valid
    isValid = true;
    receiptData = {
      expiresDate: new Date(Date.now() + (billingCycle === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000)
    };
  } else {
    throw new Error('Invalid platform specified');
  }
  
  if (!isValid) {
    throw new Error('Invalid purchase receipt');
  }
  
  // Update user subscription
  const now = new Date();
  let nextBillingDate = receiptData.expiresDate || (billingCycle === 'monthly' 
    ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    : new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000));
  
  user.subscription.plan = 'premium';
  user.subscription.billingCycle = billingCycle;
  user.subscription.isInTrial = false;
  user.subscription.lastBillingDate = now;
  user.subscription.nextBillingDate = nextBillingDate;
  user.subscription.documentLimitTotal = 50; // Premium document limit
  
  // Store platform-specific purchase info for later reference
  if (!user.subscription.platformData) {
    user.subscription.platformData = {};
  }
  
  user.subscription.platformData = {
    platform,
    productIdentifier,
    transactionId,
    purchaseDate: now,
    expiresDate: nextBillingDate
  };
  
  await user.save();
  
  return {
    message: `Successfully verified and applied ${billingCycle} subscription`,
    subscription: user.subscription
  };
};

/**
 * Restore purchases from Apple/Google
 * @param {string} userId - User ID
 * @param {string} platform - 'ios' or 'android'
 * @param {Object} purchases - Purchase data from the platform
 */
const restorePurchases = async (userId, platform, purchases) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Check if there are any active subscriptions in the purchase data
  // This is a simplified implementation - real implementation would
  // verify each purchase with Apple/Google servers
  
  let foundValidSubscription = false;
  let billingCycle = null;
  let expiryDate = null;
  
  // In a real implementation, we would process the purchases object
  // For now, we'll just simulate finding an active subscription if purchases exists
  if (purchases && Object.keys(purchases).length > 0) {
    // Get the most recent transaction in our simplified model
    const productId = Object.keys(purchases)[0];
    const purchaseDate = new Date(purchases[productId]);
    
    // Check if it's a valid product ID for monthly or yearly
    if (platform === 'ios') {
      if (productId === APPLE_PRODUCT_IDS.MONTHLY) {
        billingCycle = 'monthly';
        expiryDate = new Date(purchaseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        foundValidSubscription = true;
      } else if (productId === APPLE_PRODUCT_IDS.YEARLY) {
        billingCycle = 'yearly';
        expiryDate = new Date(purchaseDate.getTime() + 365 * 24 * 60 * 60 * 1000);
        foundValidSubscription = true;
      }
    } else if (platform === 'android') {
      // Similar logic for Google Play
      if (productId === GOOGLE_PRODUCT_IDS.MONTHLY) {
        billingCycle = 'monthly';
        expiryDate = new Date(purchaseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        foundValidSubscription = true;
      } else if (productId === GOOGLE_PRODUCT_IDS.YEARLY) {
        billingCycle = 'yearly';
        expiryDate = new Date(purchaseDate.getTime() + 365 * 24 * 60 * 60 * 1000);
        foundValidSubscription = true;
      }
    }
  }
  
  if (!foundValidSubscription) {
    return {
      message: 'No active subscriptions found to restore',
      subscription: user.subscription
    };
  }
  
  // Update the subscription
  const now = new Date();
  
  // Only update if the restored subscription is active (expiry date in the future)
  if (expiryDate > now) {
    user.subscription.plan = 'premium';
    user.subscription.billingCycle = billingCycle;
    user.subscription.isInTrial = false;
    user.subscription.lastBillingDate = now;
    user.subscription.nextBillingDate = expiryDate;
    user.subscription.documentLimitTotal = 50; // Premium document limit
    
    // Store platform details
    if (!user.subscription.platformData) {
      user.subscription.platformData = {};
    }
    
    user.subscription.platformData = {
      platform,
      restored: true,
      restoreDate: now,
      expiresDate: expiryDate
    };
    
    await user.save();
    
    return {
      message: 'Successfully restored subscription',
      subscription: user.subscription
    };
  } else {
    return {
      message: 'Found expired subscription during restore',
      subscription: user.subscription
    };
  }
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
    // Store the current billing cycle before cancelling
    user.subscription.previousBillingCycle = user.subscription.billingCycle;
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
 * Reactivate a cancelled subscription
 * @param {string} userId - User ID
 */
const reactivateSubscription = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Check if user has a premium plan that's been cancelled
  const isCanceledButActive = user.subscription.plan === 'premium' && user.subscription.billingCycle === 'none';
  
  if (!isCanceledButActive) {
    throw new Error('No cancelled subscription to reactivate');
  }
  
  // Restore the previous billing cycle (default to monthly if unknown)
  // In a real implementation, you might store the previous billing cycle when cancelling
  user.subscription.billingCycle = user.subscription.previousBillingCycle || 'monthly';
  
  // Update the next billing date based on the current date
  const now = new Date();
  if (user.subscription.billingCycle === 'monthly') {
    user.subscription.nextBillingDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  } else { // yearly
    user.subscription.nextBillingDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  }
  
  await user.save();
  
  return {
    message: 'Subscription reactivated successfully',
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
  reactivateSubscription,
  getSubscriptionDetails,
  canProcessDocument,
  incrementDocumentCount,
  verifyPurchase,
  restorePurchases,
  PRICING
}; 