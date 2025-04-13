const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocumentStatus,
  deleteDocument,
  getProcessingJobStatus,
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { validateDocumentStatus } = require('../utils/validators');
const upload = require('../config/multer');
const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');

// All routes are protected
router.use(protect);

// Upload a document
router.post('/upload', upload.single('file'), uploadDocument);

// Get all documents
router.get('/', getDocuments);

// Get, update, and delete a document by ID
router.route('/:id')
  .get(getDocumentById)
  .delete(deleteDocument);

// Update document status
router.put('/:id/status', validate(validateDocumentStatus), updateDocumentStatus);

// Get processing job status
router.get('/:id/job', getProcessingJobStatus);

// Download original file
router.get('/original/:documentId', async (req, res) => {
  try {
    // Get document
    const document = await Document.findById(req.params.documentId);
    
    // Check if document exists and belongs to current user
    if (!document || document.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Get file path
    const filePath = path.join(__dirname, '..', document.originalFileUrl);
    console.log('Original file requested:', filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('File not found at path:', filePath);
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Send file
    return res.sendFile(filePath);
  } catch (error) {
    console.error('Error downloading original file:', error);
    return res.status(500).json({ message: 'Error downloading file' });
  }
});

module.exports = router; 