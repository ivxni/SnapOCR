const subscriptionService = require('../services/subscriptionService');
const asyncHandler = require('express-async-handler');

/**
 * Get subscription details for the authenticated user
 * @route GET /api/subscription
 * @access Private
 */
const getSubscriptionDetails = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const subscriptionDetails = await subscriptionService.getSubscriptionDetails(userId);
  
  res.status(200).json(subscriptionDetails);
});

/**
 * Start a free trial
 * @route POST /api/subscription/trial
 * @access Private
 */
const startFreeTrial = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const result = await subscriptionService.startFreeTrial(userId);
  
  res.status(200).json(result);
});

/**
 * Subscribe to premium plan
 * @route POST /api/subscription/premium
 * @access Private
 */
const subscribeToPremium = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { billingCycle } = req.body;
  
  if (!billingCycle || (billingCycle !== 'monthly' && billingCycle !== 'yearly')) {
    res.status(400);
    throw new Error('Please provide a valid billing cycle (monthly or yearly)');
  }
  
  const result = await subscriptionService.subscribeToPremium(userId, billingCycle);
  
  res.status(200).json(result);
});

/**
 * Cancel subscription
 * @route POST /api/subscription/cancel
 * @access Private
 */
const cancelSubscription = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const result = await subscriptionService.cancelSubscription(userId);
  
  res.status(200).json(result);
});

/**
 * Reactivate a cancelled subscription
 * @route POST /api/subscription/reactivate
 * @access Private
 */
const reactivateSubscription = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const result = await subscriptionService.reactivateSubscription(userId);
  
  res.status(200).json(result);
});

/**
 * Check if user can process a document
 * @route GET /api/subscription/can-process
 * @access Private
 */
const canProcessDocument = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const result = await subscriptionService.canProcessDocument(userId);
  
  res.status(200).json(result);
});

/**
 * Increment document count
 * @route POST /api/subscription/increment
 * @access Private
 */
const incrementDocumentCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  try {
    const result = await subscriptionService.incrementDocumentCount(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  getSubscriptionDetails,
  startFreeTrial,
  subscribeToPremium,
  cancelSubscription,
  reactivateSubscription,
  canProcessDocument,
  incrementDocumentCount
}; 