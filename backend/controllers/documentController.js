const Document = require('../models/Document');
const ProcessingJob = require('../models/ProcessingJob');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const ocrService = require('../services/ocrService');

// @desc    Upload a document
// @route   POST /api/documents/upload
// @access  Private
const uploadDocument = async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  // Log environment check for debugging
  console.log('Environment check:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- Mistral API Key configured:', process.env.MISTRAL_API_KEY ? 'Yes' : 'No');
  
  if (!process.env.MISTRAL_API_KEY) {
    console.error('MISTRAL_API_KEY is not configured in environment variables!');
  }

  // Create document record
  const document = await Document.create({
    userId: req.user._id,
    originalFileName: req.file.originalname,
    originalFileType: req.file.mimetype,
    originalFileSize: req.file.size,
    originalFileUrl: `/uploads/${req.user._id}/${req.file.filename}`,
    status: 'processing',
  });

  // Create processing job
  const processingJob = await ProcessingJob.create({
    documentId: document._id,
    userId: req.user._id,
    status: 'queued',
  });

  console.log(`Created document ${document._id} and processing job ${processingJob._id}`);

  // Start OCR processing in the background
  // In a production app, this would be handled by a queue system like Bull
  setTimeout(async () => {
    try {
      console.log(`Starting OCR processing for document ${document._id}`);
      await ocrService.processImage(document._id, req.user._id);
    } catch (error) {
      console.error('Background OCR processing error:', error);
    }
  }, 0);

  res.status(201).json({
    document: {
      _id: document._id,
      originalFileName: document.originalFileName,
      status: document.status,
    },
    processingJob: {
      _id: processingJob._id,
      status: processingJob.status,
    },
  });
};

// @desc    Get all documents for a user
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res) => {
  const documents = await Document.find({ userId: req.user._id })
    .sort({ createdAt: -1 });

  res.json(documents);
};

// @desc    Get a document by ID
// @route   GET /api/documents/:id
// @access  Private
const getDocumentById = async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }

  // Check if the document belongs to the user
  if (document.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to access this document');
  }

  res.json(document);
};

// @desc    Update document status
// @route   PUT /api/documents/:id/status
// @access  Private
const updateDocumentStatus = async (req, res) => {
  const { status } = req.body;

  const document = await Document.findById(req.params.id);

  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }

  // Check if the document belongs to the user
  if (document.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this document');
  }

  document.status = status;

  if (status === 'completed') {
    document.processingCompletedAt = Date.now();
  }

  const updatedDocument = await document.save();

  res.json(updatedDocument);
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }

  // Check if the document belongs to the user
  if (document.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this document');
  }

  // Delete the file from the server
  if (document.originalFileUrl) {
    const filePath = path.join(__dirname, '..', document.originalFileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  if (document.pdfFileUrl) {
    const pdfPath = path.join(__dirname, '..', document.pdfFileUrl);
    if (fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
    }
  }

  // Delete the document and associated processing jobs
  await ProcessingJob.deleteMany({ documentId: document._id });
  await document.deleteOne();

  res.json({ message: 'Document removed' });
};

// @desc    Get processing job status
// @route   GET /api/documents/:id/job
// @access  Private
const getProcessingJobStatus = async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }

  // Check if the document belongs to the user
  if (document.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to access this document');
  }

  const processingJob = await ProcessingJob.findOne({ documentId: document._id });

  if (!processingJob) {
    res.status(404);
    throw new Error('Processing job not found');
  }

  res.json(processingJob);
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocumentStatus,
  deleteDocument,
  getProcessingJobStatus,
}; 