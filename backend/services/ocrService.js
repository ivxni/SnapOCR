const axios = require('axios');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const Document = require('../models/Document');
const ProcessingJob = require('../models/ProcessingJob');
const { Mistral } = require('@mistralai/mistralai');
const sizeOf = require('image-size');

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

    // Call Mistral OCR API with purpose=ocr to get text positions
    const ocrResponse = await client.ocr.process({
      model: 'mistral-ocr-latest',
      document: {
        type: 'image_url',
        imageUrl: `data:${fileType};base64,${base64Image}`
      },
      include_image_base64: true, // Include images in response
      include_layout_info: true,   // Request layout information
      purpose: 'ocr'  // Request detailed positioning information
    });

    console.log('Received OCR response from Mistral API:', ocrResponse ? 'Response received' : 'No response');
    // Log the structure of the OCR response for debugging
    console.log('OCR response structure:', JSON.stringify({
      hasPages: !!ocrResponse.pages,
      pageCount: ocrResponse.pages ? ocrResponse.pages.length : 0,
      firstPageKeys: ocrResponse.pages && ocrResponse.pages[0] ? Object.keys(ocrResponse.pages[0]) : [],
      hasBlocks: ocrResponse.pages && ocrResponse.pages[0] && ocrResponse.pages[0].blocks ? true : false,
      blockCount: ocrResponse.pages && ocrResponse.pages[0] && ocrResponse.pages[0].blocks ? ocrResponse.pages[0].blocks.length : 0
    }, null, 2));

    // Update progress
    processingJob.progress = 70;
    await processingJob.save();

    // Create directory for user documents if it doesn't exist
    const userDir = path.join(__dirname, '..', 'uploads', userId.toString());
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    // Extract content from OCR response
    const pages = ocrResponse.pages || [];
    const markdownContent = pages.map(page => page.markdown || '').join('\n\n');

    // Update document with OCR text
    document.ocrText = markdownContent;
    document.status = 'completed';
    document.processingCompletedAt = new Date();
    
    // Create PDF file path
    const pdfFileName = `${document.originalFileName.split('.')[0]}.pdf`;
    const pdfFilePath = path.join(userDir, pdfFileName);

    // IMPROVED PDF CREATION: Create a PDF with extracted content from the image
    await createExactPDF(fileBuffer, pdfFilePath, document.originalFileName, ocrResponse);

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

/**
 * Creates a PDF with extracted content from the image
 * @param {Buffer} imageBuffer - The original image buffer
 * @param {string} outputPath - Path where to save the PDF
 * @param {string} fileName - Name of the document
 * @param {Object} ocrResponse - The response from Mistral OCR API
 */
async function createExactPDF(imageBuffer, outputPath, fileName, ocrResponse) {
  try {
    // Create a PDF document
    const pdfDoc = new PDFDocument({
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      },
      info: {
        Title: fileName,
        Author: 'LynxAI OCR',
        Subject: 'OCR Document',
        Keywords: 'OCR, PDF, Document'
      }
    });
    
    // Create write stream
    const writeStream = fs.createWriteStream(outputPath);
    pdfDoc.pipe(writeStream);
    
    // Extract content from OCR response
    const pages = ocrResponse.pages || [];
    
    // Stelle sicher, dass wir gültige Seiten haben
    if (!pages.length) {
      console.log('Keine Seiten in der OCR-Antwort gefunden. Erstelle eine einfache PDF mit dem Bild.');
      
      // Füge nur das Bild ein, wenn keine OCR-Daten verfügbar sind
      pdfDoc.image(imageBuffer, {
        fit: [500, 700],
        align: 'center',
        valign: 'center'
      });
      
      pdfDoc.end();
      
      // Wait for the PDF to be written
      return new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
    }

    // Add title
    try {
      // Titel wird entfernt, wie vom Benutzer gewünscht
      // pdfDoc.fontSize(24).font('Helvetica-Bold').text(fileName, {
      //   align: 'center'
      // });
      // pdfDoc.moveDown();
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Titels:', error);
    }
    
    // Process each page from OCR
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      
      // Add page number if not the first page
      if (i > 0) {
        pdfDoc.addPage();
        
        // Titel auf neuen Seiten auch entfernt
        // pdfDoc.fontSize(24).font('Helvetica-Bold').text(fileName, {
        //   align: 'center'
        // });
        // pdfDoc.moveDown();
      }
      
      // Check if we have detailed block information for formatting
      if (page.blocks && Array.isArray(page.blocks) && page.blocks.length > 0) {
        console.log(`Processing ${page.blocks.length} text blocks with formatting`);
        
        // Process each block maintaining structure
        for (const block of page.blocks) {
          if (block.type === 'text' && block.text) {
            // Determine font style based on block properties
            const isBold = block.bold || false;
            const isItalic = block.italic || false;
            const fontSize = block.fontSize || 12;
            
            // Set font based on style - VORSICHT: Nur Standardschriften verwenden!
            if (isBold && isItalic) {
              pdfDoc.font('Helvetica-BoldOblique');
            } else if (isBold) {
              pdfDoc.font('Helvetica-Bold');
            } else if (isItalic) {
              pdfDoc.font('Helvetica-Oblique');
            } else {
              pdfDoc.font('Helvetica');
            }
            
            // Set font size
            pdfDoc.fontSize(fontSize);
            
            // Add text with alignment if available
            pdfDoc.text(block.text, {
              align: block.alignment || 'left'
            });
            
            // Add a small space between blocks
            if (block.text.trim() !== '') {
              pdfDoc.moveDown(0.5);
            }
          } else if (block.type === 'heading' && block.text) {
            // Headings with proper formatting
            const level = block.level || 1;
            const fontSize = level === 1 ? 18 : level === 2 ? 16 : 14;
            
            pdfDoc.font('Helvetica-Bold').fontSize(fontSize);
            pdfDoc.text(block.text, {
              align: 'left'
            });
            pdfDoc.moveDown();
          } else if (block.type === 'list' && block.items && Array.isArray(block.items)) {
            // Lists with proper formatting
            pdfDoc.font('Helvetica').fontSize(12);
            
            block.items.forEach((item, index) => {
              pdfDoc.text(`• ${item}`, {
                indent: 10,
                align: 'left'
              });
              
              if (index < block.items.length - 1) {
                pdfDoc.moveDown(0.5);
              }
            });
            
            pdfDoc.moveDown();
          }
        }
      } else if (page.layout && Array.isArray(page.layout) && page.layout.length > 0) {
        // Alternative format: Using layout elements
        console.log(`Processing ${page.layout.length} layout elements`);
        
        for (const element of page.layout) {
          if (element.type === 'text' && element.text) {
            const fontSize = element.fontSize || 12;
            pdfDoc.font('Helvetica').fontSize(fontSize);
            
            pdfDoc.text(element.text, {
              align: element.alignment || 'left'
            });
            
            pdfDoc.moveDown(0.5);
          }
        }
      } else if (page.markdown) {
        // Fallback to markdown if no structured blocks
        console.log('Using markdown content for formatting');
        
        // Parse markdown content
        const lines = page.markdown.split('\n');
        
        for (const line of lines) {
          // Detect headings
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
          } else if (line.startsWith('- ') || line.startsWith('* ')) {
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
      }
      
      // Add original image thumbnail at the end of the page
      // Das Original-Bild wird entfernt, wie vom Benutzer gewünscht
      /*
      try {
        const imgWidth = 200;
        const imgHeight = 200;
        
        pdfDoc.moveDown(2);
        
        // Standard-Schriftart verwenden
        pdfDoc.fontSize(10).font('Helvetica').text('Original Image:', {
          align: 'center'
        });
        pdfDoc.moveDown(0.5);
        
        // Center the image
        const pageWidth = pdfDoc.page.width - pdfDoc.page.margins.left - pdfDoc.page.margins.right;
        const xPosition = pdfDoc.page.margins.left + (pageWidth - imgWidth) / 2;
        
        // Prüfe, ob das Bild gültig ist
        if (imageBuffer && imageBuffer.length > 0) {
          pdfDoc.image(imageBuffer, xPosition, pdfDoc.y, {
            width: imgWidth,
            height: imgHeight,
            fit: [imgWidth, imgHeight]
          });
        } else {
          pdfDoc.text('(Image not available)', {
            align: 'center'
          });
        }
      } catch (imgError) {
        console.error('Error adding image thumbnail to PDF:', imgError);
        // Füge einen Text statt des Bildes ein
        pdfDoc.text('(Image could not be displayed)', {
          align: 'center'
        });
      }
      */
      
      // Add page number at the bottom
      const pageNumber = i + 1;
      const totalPages = pages.length;
      
      pdfDoc.fontSize(10).text(`Page ${pageNumber} of ${totalPages}`, {
        align: 'center',
        y: pdfDoc.page.height - 50
      });
    }
    
    // Finalize the PDF
    pdfDoc.end();
    
    // Wait for the PDF to be written
    return new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
  } catch (error) {
    console.error('Error creating PDF with extracted content:', error);
    throw error;
  }
}

module.exports = {
  processImage,
}; 