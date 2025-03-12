const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ShareInfoSchema = new mongoose.Schema({
  shareId: {
    type: String,
    default: uuidv4
  },
  shareType: {
    type: String,
    enum: ['email', 'link'],
    default: 'link'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date,
  accessCount: {
    type: Number,
    default: 0
  },
  recipientEmail: String
});

const DocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  pdfFileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'fs.files'
  },
  storageUrl: String,
  textContent: String,
  pageCount: Number,
  isArchived: {
    type: Boolean,
    default: false
  },
  shareInfo: [ShareInfoSchema],
  tags: [String],
  metadata: {
    ocrConfidence: Number,
    processingTime: Number,
    imageQuality: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  }
});

// Index für die Textsuche erstellen
DocumentSchema.index({ textContent: 'text' });

module.exports = mongoose.model('Document', DocumentSchema); 