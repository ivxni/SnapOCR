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

  // Überprüfe, ob die Datei verschlüsselt ist
  let isEncrypted = false;
  let keyFingerprint = null;
  let encryptionVersion = null;

  try {
    // Überprüfe, ob Metadaten vorhanden sind
    if (req.body.metadata) {
      // Wenn Metadaten als String vorliegen, parsen
      const metadata = typeof req.body.metadata === 'string' 
        ? JSON.parse(req.body.metadata) 
        : req.body.metadata;
      
      isEncrypted = metadata.isEncrypted === true || metadata.isEncrypted === 'true';
      keyFingerprint = metadata.keyFingerprint;
      encryptionVersion = metadata.encryptionVersion;
    }
  } catch (error) {
    console.error('Error parsing metadata:', error);
    // Wenn es einen Fehler beim Parsen gibt, ignorieren wir die Metadaten
  }

  console.log('File encryption status:', isEncrypted ? 'Encrypted' : 'Not encrypted');
  if (isEncrypted) {
    console.log('Encryption metadata:', { keyFingerprint, encryptionVersion });
  }

  // Create document record with encryption info if available
  const document = await Document.create({
    userId: req.user._id,
    originalFileName: req.file.originalname,
    originalFileType: req.file.mimetype,
    originalFileSize: req.file.size,
    originalFileUrl: `/uploads/${req.user._id}/${req.file.filename}`,
    status: 'processing',
    isEncrypted: isEncrypted || false,
    encryptionMetadata: isEncrypted 
      ? {
          keyFingerprint,
          encryptionVersion
        }
      : undefined
  });

  // Create processing job
  const processingJob = await ProcessingJob.create({
    documentId: document._id,
    userId: req.user._id,
    status: 'queued',
  });

  console.log(`Created document ${document._id} and processing job ${processingJob._id}`);

  // Bei verschlüsselten Dateien überspringen wir die OCR und markieren das Dokument direkt als fertig
  if (isEncrypted) {
    console.log(`Document ${document._id} is encrypted, skipping OCR processing`);
    
    // Markiere das Dokument als abgeschlossen
    document.status = 'completed';
    document.processingCompletedAt = new Date();
    await document.save();
    
    // Markiere den Job als abgeschlossen
    processingJob.status = 'completed';
    processingJob.progress = 100;
    processingJob.endTime = new Date();
    await processingJob.save();
    
    // Sende Bestätigung zurück
    return res.status(201).json({
      document: {
        _id: document._id,
        originalFileName: document.originalFileName,
        status: document.status,
        isEncrypted: true
      },
      processingJob: {
        _id: processingJob._id,
        status: processingJob.status,
        progress: 100
      },
    });
  }

  // Nur für nicht-verschlüsselte Dateien: Starte OCR-Verarbeitung im Hintergrund
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
      isEncrypted: document.isEncrypted || false
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