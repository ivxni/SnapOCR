const express = require('express');
const { protect } = require('../middleware/auth');
const subscriptionController = require('../controllers/subscriptionController');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get subscription details
router.get('/', subscriptionController.getSubscriptionDetails);

// Start free trial
router.post('/trial', subscriptionController.startFreeTrial);

// Subscribe to premium
router.post('/premium', subscriptionController.subscribeToPremium);

// Cancel subscription
router.post('/cancel', subscriptionController.cancelSubscription);

// Check if user can process a document
router.get('/can-process', subscriptionController.canProcessDocument);

// Increment document count
router.post('/increment', subscriptionController.incrementDocumentCount);

module.exports = router; 