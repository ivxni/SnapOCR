const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');
const ProcessingJob = require('../models/ProcessingJob');

/**
 * Process an image with OCR using the Mistral API
 * @param {string} documentId - The ID of the document to process
 * @param {string} userId - The ID of the user who owns the document
 * @returns {Promise<Object>} - The processing result
 */
const processImage = async (documentId, userId) => {
  try {
    // Get the document from the database
    const document = await Document.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Get the processing job from the database
    const processingJob = await ProcessingJob.findOne({ documentId });
    if (!processingJob) {
      throw new Error('Processing job not found');
    }

    // Update job status to processing
    processingJob.status = 'processing';
    processingJob.startTime = new Date();
    processingJob.progress = 10;
    await processingJob.save();

    // Get the file path
    const filePath = path.join(__dirname, '..', document.originalFileUrl);
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    // Read the file as base64
    const fileBuffer = fs.readFileSync(filePath);
    const base64Image = fileBuffer.toString('base64');

    // Update progress
    processingJob.progress = 30;
    await processingJob.save();

    // Call Mistral API for OCR
    const response = await axios.post(
      'https://api.mistral.ai/v1/ocr',
      {
        image: base64Image,
        model: 'mistral-large-ocr',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
        },
      }
    );

    // Update progress
    processingJob.progress = 70;
    await processingJob.save();

    // Extract text from response
    const ocrText = response.data.text;

    // Update document with OCR text
    document.ocrText = ocrText;
    document.status = 'completed';
    document.processingCompletedAt = new Date();
    await document.save();

    // Create PDF (in a real app, we would generate a PDF from the OCR text)
    // For now, we'll just update the document with dummy PDF info
    document.pdfFileName = `${document.originalFileName.split('.')[0]}.pdf`;
    document.pdfFileSize = fileBuffer.length; // Just a placeholder
    document.pdfFileUrl = `/uploads/${userId}/${document.pdfFileName}`;
    await document.save();

    // Update job status to completed
    processingJob.status = 'completed';
    processingJob.progress = 100;
    processingJob.endTime = new Date();
    await processingJob.save();

    return {
      document,
      processingJob,
    };
  } catch (error) {
    console.error('OCR processing error:', error);

    // Update document status to failed
    const document = await Document.findById(documentId);
    if (document) {
      document.status = 'failed';
      document.errorMessage = error.message;
      await document.save();
    }

    // Update job status to failed
    const processingJob = await ProcessingJob.findOne({ documentId });
    if (processingJob) {
      processingJob.status = 'failed';
      processingJob.errorDetails = error.message;
      processingJob.endTime = new Date();
      await processingJob.save();
    }

    throw error;
  }
};

module.exports = {
  processImage,
}; 