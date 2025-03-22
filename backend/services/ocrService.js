const axios = require('axios');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const Document = require('../models/Document');
const ProcessingJob = require('../models/ProcessingJob');
const { Mistral } = require('@mistralai/mistralai');

/**
 * Process an image with OCR using the Mistral API
 * @param {string} documentId - The ID of the document to process
 * @param {string} userId - The ID of the user who owns the document
 * @returns {Promise<Object>} - The processing result
 */
const processImage = async (documentId, userId) => {
  console.log('OCR processImage started:', { documentId, userId });
  try {
    // Get the document from the database
    const document = await Document.findById(documentId);
    if (!document) {
      console.error('Document not found:', documentId);
      throw new Error('Document not found');
    }
    console.log('Found document:', document._id);

    // Get the processing job from the database
    const processingJob = await ProcessingJob.findOne({ documentId });
    if (!processingJob) {
      console.error('Processing job not found for document:', documentId);
      throw new Error('Processing job not found');
    }
    console.log('Found processing job:', processingJob._id);

    // Update job status to processing
    processingJob.status = 'processing';
    processingJob.startTime = new Date();
    processingJob.progress = 10;
    await processingJob.save();
    console.log('Updated processing job to processing status');

    // Get the file path
    const filePath = path.join(__dirname, '..', document.originalFileUrl);
    console.log('Looking for file at path:', filePath);
    if (!fs.existsSync(filePath)) {
      console.error('File not found at path:', filePath);
      throw new Error('File not found');
    }
    console.log('Found file at path:', filePath);

    // Read the file as base64
    const fileBuffer = fs.readFileSync(filePath);
    const base64Image = fileBuffer.toString('base64');
    const fileType = document.originalFileType || 'image/jpeg';
    console.log('Read file of type:', fileType, 'size:', fileBuffer.length);

    // Update progress
    processingJob.progress = 30;
    await processingJob.save();
    console.log('Updated processing job progress to 30%');

    // Initialize Mistral client
    console.log('Initializing Mistral client with API key:', process.env.MISTRAL_API_KEY ? 'API key found' : 'API key missing');
    const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

    console.log('Sending OCR request to Mistral API...');

    // Call Mistral OCR API
    const ocrResponse = await client.ocr.process({
      model: 'mistral-ocr-latest',
      document: {
        type: 'document_url',
        imageUrl: `data:${fileType};base64,${base64Image}`
      },
      include_image_base64: true // Include images in response
    });

    console.log('Received OCR response from Mistral API:', ocrResponse ? 'Response received' : 'No response');

    // Update progress
    processingJob.progress = 70;
    await processingJob.save();

    // Create directory for user documents if it doesn't exist
    const userDir = path.join(__dirname, '..', 'uploads', userId.toString());
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    // Extract content from OCR response
    const pages = ocrResponse.pages;
    const markdownContent = pages.map(page => page.markdown).join('\n\n');

    // Update document with OCR text
    document.ocrText = markdownContent;
    document.status = 'completed';
    document.processingCompletedAt = new Date();
    
    // Get images from the response if they exist
    const images = [];
    pages.forEach(page => {
      if (page.images && page.images.length > 0) {
        images.push(...page.images);
      }
    });

    // Create PDF file path
    const pdfFileName = `${document.originalFileName.split('.')[0]}.pdf`;
    const pdfFilePath = path.join(userDir, pdfFileName);

    // Create a PDF document
    const pdfDoc = new PDFDocument({
      info: {
        Title: document.originalFileName,
        Author: 'LynxAI OCR',
        Subject: 'OCR Document',
        Keywords: 'OCR, PDF, Document'
      },
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });

    // Create write stream
    const writeStream = fs.createWriteStream(pdfFilePath);
    pdfDoc.pipe(writeStream);

    // Add title
    pdfDoc.fontSize(24).font('Helvetica-Bold').text(document.originalFileName, {
      align: 'center'
    });
    pdfDoc.moveDown();

    // Process each page from OCR
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      
      // Add page number if not the first page
      if (i > 0) {
        pdfDoc.addPage();
      }

      // Add content to PDF
      pdfDoc.fontSize(12).font('Helvetica');
      
      // Split the markdown content by lines and process
      const lines = page.markdown.split('\n');
      for (const line of lines) {
        if (line.startsWith('# ')) {
          // Heading 1
          pdfDoc.fontSize(18).font('Helvetica-Bold').text(line.replace('# ', ''));
          pdfDoc.moveDown(0.5);
        } else if (line.startsWith('## ')) {
          // Heading 2
          pdfDoc.fontSize(16).font('Helvetica-Bold').text(line.replace('## ', ''));
          pdfDoc.moveDown(0.5);
        } else if (line.startsWith('### ')) {
          // Heading 3
          pdfDoc.fontSize(14).font('Helvetica-Bold').text(line.replace('### ', ''));
          pdfDoc.moveDown(0.5);
        } else if (line.startsWith('- ')) {
          // List item
          pdfDoc.fontSize(12).font('Helvetica').text(line, { indent: 10 });
        } else if (line.trim() === '') {
          // Empty line
          pdfDoc.moveDown(0.5);
        } else {
          // Normal text
          pdfDoc.fontSize(12).font('Helvetica').text(line);
        }
      }

      // Add images if any for this page
      if (page.images && page.images.length > 0) {
        for (const img of page.images) {
          if (img.base64) {
            try {
              // Add some spacing
              pdfDoc.moveDown();
              
              // Calculate image dimensions to fit in the page
              const imgWidth = Math.min(400, pdfDoc.page.width - 100);
              
              // Add the image
              pdfDoc.image(Buffer.from(img.base64, 'base64'), {
                width: imgWidth,
                align: 'center'
              });
              
              pdfDoc.moveDown();
            } catch (imgError) {
              console.error('Error adding image to PDF:', imgError);
            }
          }
        }
      }
      
      // Add page number at the bottom
      const pageNumber = i + 1;
      pdfDoc.fontSize(10).text(`Page ${pageNumber} of ${pages.length}`, {
        align: 'center',
        y: pdfDoc.page.height - 50
      });
    }

    // Finalize the PDF
    pdfDoc.end();

    // Wait for the PDF to be written
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Update document with PDF info
    document.pdfFileName = pdfFileName;
    document.pdfFileSize = fs.statSync(pdfFilePath).size;
    document.pdfFileUrl = `/uploads/${userId}/${pdfFileName}`;
    
    // Log the final PDF location
    console.log('Generated PDF file:', pdfFilePath);
    console.log('PDF URL path:', document.pdfFileUrl);
    
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
    console.error('OCR processing error details:', error.message, error.stack);

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