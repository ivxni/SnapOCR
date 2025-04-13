const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    originalFileType: {
      type: String,
      required: true,
    },
    originalFileSize: {
      type: Number,
      required: true,
    },
    originalFileUrl: {
      type: String,
      required: true,
    },
    pdfFileName: {
      type: String,
    },
    pdfFileSize: {
      type: Number,
    },
    pdfFileUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
    processingStartedAt: {
      type: Date,
      default: Date.now,
    },
    processingCompletedAt: {
      type: Date,
    },
    errorMessage: {
      type: String,
    },
    ocrText: {
      type: String,
    },
    tags: [String],
    isStarred: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isEncrypted: {
      type: Boolean,
      default: false,
    },
    encryptionMetadata: {
      keyFingerprint: String,
      encryptionVersion: String,
    },
    metadata: {
      pageCount: Number,
      dimensions: {
        width: Number,
        height: Number,
      },
      detectedLanguage: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
documentSchema.index({ userId: 1, createdAt: -1 });
documentSchema.index({ userId: 1, isArchived: 1 });
documentSchema.index({ status: 1 });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document; 