const mongoose = require('mongoose');

const processingJobSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'failed'],
      default: 'queued',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    mistralJobId: {
      type: String,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    errorDetails: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
processingJobSchema.index({ documentId: 1 });
processingJobSchema.index({ userId: 1 });
processingJobSchema.index({ status: 1 });

const ProcessingJob = mongoose.model('ProcessingJob', processingJobSchema);

module.exports = ProcessingJob; 