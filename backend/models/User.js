const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'premium'],
        default: 'free',
      },
      billingCycle: {
        type: String,
        enum: ['none', 'monthly', 'yearly'],
        default: 'none',
      },
      trialStartDate: Date,
      trialEndDate: Date,
      isInTrial: {
        type: Boolean, 
        default: false
      },
      lastBillingDate: Date,
      nextBillingDate: Date,
      documentLimitTotal: {
        type: Number,
        default: 5, // Default for free users
      },
      documentLimitUsed: {
        type: Number,
        default: 0,
      },
      documentLimitResetDate: Date, // Weekly reset for free users
    },
    preferences: {
      notifications: {
        type: Boolean,
        default: true,
      },
      theme: {
        type: String,
        default: 'light',
      },
      language: {
        type: String,
        default: 'en',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Set the document limit based on subscription plan
userSchema.methods.updateDocumentLimit = function() {
  const now = new Date();
  
  // For free users, 5 documents per week
  if (this.subscription.plan === 'free') {
    this.subscription.documentLimitTotal = 5;
    
    // If reset date is not set or has passed
    if (!this.subscription.documentLimitResetDate || this.subscription.documentLimitResetDate < now) {
      // Reset counter and set next reset date to 1 week from now
      this.subscription.documentLimitUsed = 0;
      this.subscription.documentLimitResetDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
  } 
  // For premium users, 50 documents per month
  else if (this.subscription.plan === 'premium') {
    this.subscription.documentLimitTotal = 50;
    
    // If reset date is not set or has passed
    if (!this.subscription.documentLimitResetDate || this.subscription.documentLimitResetDate < now) {
      // Reset counter and set next reset date to next billing date
      this.subscription.documentLimitUsed = 0;
      this.subscription.documentLimitResetDate = this.subscription.nextBillingDate;
    }
  }
  
  return this;
};

// Check if user can process more documents
userSchema.methods.canProcessDocument = function() {
  return this.subscription.documentLimitUsed < this.subscription.documentLimitTotal;
};

// Increment the document counter
userSchema.methods.incrementDocumentCount = function() {
  this.subscription.documentLimitUsed += 1;
  return this;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 