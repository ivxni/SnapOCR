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
    // Create a PDF document with optimized structure for more content on a single page
    const pdfDoc = new PDFDocument({
      margins: {
        top: 40, // Reduzierter oberer Rand
        bottom: 40, // Reduzierter unterer Rand
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

    // Immer alle erkannten Inhalte auf eine einzige Seite setzen
    console.log('Kombiniere alle erkannten Inhalte auf eine Seite (optimiert)');
    
    // Kombiniere Texte aller Seiten
    let allBlocks = [];
    let allLayouts = [];
    let allMarkdown = '';
    
    pages.forEach(page => {
      if (page.blocks && Array.isArray(page.blocks)) {
        allBlocks = allBlocks.concat(page.blocks);
      }
      if (page.layout && Array.isArray(page.layout)) {
        allLayouts = allLayouts.concat(page.layout);
      }
      if (page.markdown) {
        allMarkdown += page.markdown + '\n\n';
      }
    });
    
    // Erstelle ein kombiniertes Seitenobject
    const combinedPage = {
      blocks: allBlocks.length > 0 ? allBlocks : undefined,
      layout: allLayouts.length > 0 ? allLayouts : undefined,
      markdown: allMarkdown || undefined
    };
    
    // Verarbeite diese eine kombinierte Seite
    processPageOptimized(pdfDoc, combinedPage);
    
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

/**
 * Verarbeitet eine einzelne Seite für das PDF - optimiert für mehr Inhalt auf einer Seite
 * @param {PDFDocument} pdfDoc - Das PDFKit-Dokument
 * @param {Object} page - Die Seiten-Daten
 */
function processPageOptimized(pdfDoc, page) {
  // Check if we have detailed block information for formatting
  if (page.blocks && Array.isArray(page.blocks) && page.blocks.length > 0) {
    console.log(`Processing ${page.blocks.length} text blocks with optimized formatting`);
    
    // Process each block maintaining structure
    let currentSection = null;
    let inList = false;
    let isFirstBlock = true;
    
    for (const block of page.blocks) {
      if (block.type === 'text' && block.text) {
        // Determine font style based on block properties
        const isBold = block.bold || false;
        const isItalic = block.italic || false;
        
        // Kleinere Schriftgrößen für alles
        let fontSize = block.fontSize ? Math.max(8, block.fontSize * 0.85) : 10;
        
        // Detect section headings based on font size or style
        const isHeading = isBold || fontSize >= 12;
        
        // Anrede erkennen (z.B. "Sehr geehrte", "Liebe", usw.)
        const isGreeting = block.text.match(/^(Sehr geehrte|Liebe|Hallo|Guten Tag|Betreff)/i);
        
        if (isHeading && currentSection !== block.text) {
          // Start a new section with reduced space before
          if (!isFirstBlock) {
            pdfDoc.moveDown(0.5); // Reduzierter Abstand vor Überschriften
          }
          currentSection = block.text;
          
          // Set font based on style with smaller font size
          pdfDoc.font('Helvetica-Bold').fontSize(Math.min(14, Math.max(12, fontSize)));
          
          // Add text with alignment if available
          pdfDoc.text(block.text, {
            align: 'left',
            lineGap: 2 // Reduzierter Zeilenabstand
          });
          
          // Dünnere Trennlinie
          pdfDoc.moveDown(0.3);
          const lineWidth = pdfDoc.widthOfString(block.text);
          pdfDoc
            .moveTo(pdfDoc.x, pdfDoc.y)
            .lineTo(pdfDoc.x + Math.min(lineWidth, 300), pdfDoc.y)
            .lineWidth(0.5) // Dünnere Linie
            .stroke();
          
          pdfDoc.moveDown(0.3);
          inList = false;
        } else if (isGreeting) {
          // Anrede mit kleinerer Schrift und weniger Abstand
          if (isBold) {
            pdfDoc.font('Helvetica-Bold');
          } else {
            pdfDoc.font('Helvetica');
          }
          
          pdfDoc.fontSize(10); // Kleinere Schrift für Anrede
          
          if (!isFirstBlock) {
            pdfDoc.moveDown(0.3);
          }
          
          pdfDoc.text(block.text, {
            align: 'left',
            lineGap: 1 // Sehr geringer Zeilenabstand
          });
          
          pdfDoc.moveDown(0.3);
        } else {
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
          
          // Set smaller font size
          pdfDoc.fontSize(fontSize);
          
          // Check if this is a new paragraph
          if (!inList && block.text.trim() !== '') {
            const isIndented = block.x > 60; // Detect if this is indented
            
            // Add text with alignment if available
            pdfDoc.text(block.text, {
              align: block.alignment || 'left',
              indent: isIndented ? 15 : 0, // Reduzierte Einrückung
              paragraphGap: 3, // Reduzierter Abstand zwischen Absätzen
              lineGap: 1 // Reduzierter Zeilenabstand
            });
            
            // Only add minimal space if not empty
            if (block.text.trim() !== '') {
              pdfDoc.moveDown(0.3); // Reduzierter Abstand
            }
          } else {
            // Continue list or paragraph
            pdfDoc.text(block.text, {
              align: block.alignment || 'left',
              indent: inList ? 15 : 0, // Reduzierte Einrückung
              continued: false,
              lineGap: 1 // Reduzierter Zeilenabstand
            });
            pdfDoc.moveDown(0.3); // Reduzierter Abstand
          }
        }
      } else if (block.type === 'heading' && block.text) {
        // Headings with optimized formatting
        const level = block.level || 1;
        // Kleinere Überschriften
        const fontSize = level === 1 ? 14 : level === 2 ? 12 : 11;
        
        // Add reduced space before headings
        if (!isFirstBlock) {
          pdfDoc.moveDown(0.5);
        }
        
        pdfDoc.font('Helvetica-Bold').fontSize(fontSize);
        pdfDoc.text(block.text, {
          align: 'left',
          lineGap: 2 // Reduzierter Zeilenabstand
        });
        
        // Add a thinner separator line for major headings
        if (level <= 2) {
          pdfDoc.moveDown(0.3);
          const lineWidth = pdfDoc.widthOfString(block.text);
          pdfDoc
            .moveTo(pdfDoc.x, pdfDoc.y)
            .lineTo(pdfDoc.x + Math.min(lineWidth, 300), pdfDoc.y)
            .lineWidth(0.5) // Dünnere Linie
            .stroke();
        }
        
        pdfDoc.moveDown(0.3);
        currentSection = block.text;
        inList = false;
      } else if (block.type === 'list' && block.items && Array.isArray(block.items)) {
        // Lists with optimized formatting
        pdfDoc.font('Helvetica').fontSize(10); // Kleinere Schrift für Listen
        
        block.items.forEach((item, index) => {
          inList = true;
          const bulletPoint = block.ordered ? `${index+1}. ` : '• ';
          
          pdfDoc.text(bulletPoint + item, {
            indent: 15, // Reduzierte Einrückung
            align: 'left',
            paragraphGap: 2, // Reduzierter Abstand
            lineGap: 1 // Reduzierter Zeilenabstand
          });
          
          if (index < block.items.length - 1) {
            pdfDoc.moveDown(0.2); // Minimaler Abstand zwischen Listenelementen
          }
        });
        
        pdfDoc.moveDown(0.3);
        inList = false;
      }
      
      isFirstBlock = false;
    }
  } else if (page.layout && Array.isArray(page.layout) && page.layout.length > 0) {
    // Alternative format: Using layout elements
    console.log(`Processing ${page.layout.length} layout elements with optimization`);
    
    let currentY = pdfDoc.y;
    let columnPositions = [];
    
    // First pass: detect possible columns by analyzing X positions
    page.layout.forEach(element => {
      if (element.x && !columnPositions.includes(element.x)) {
        columnPositions.push(element.x);
      }
    });
    
    // Sort column positions
    columnPositions.sort((a, b) => a - b);
    
    // Determine if we have a table-like structure (3+ columns)
    const hasTableStructure = columnPositions.length >= 3;
    
    // Second pass: add content with better formatting
    for (const element of page.layout) {
      if (element.type === 'text' && element.text) {
        // Kleinere Schriftgröße für alles
        const fontSize = element.fontSize ? Math.max(8, element.fontSize * 0.85) : 10;
        const isBold = element.bold || false;
        const isItalic = element.italic || false;
        
        // Set appropriate font
        if (isBold && isItalic) {
          pdfDoc.font('Helvetica-BoldOblique');
        } else if (isBold) {
          pdfDoc.font('Helvetica-Bold');
        } else if (isItalic) {
          pdfDoc.font('Helvetica-Oblique');
        } else {
          pdfDoc.font('Helvetica');
        }
        
        pdfDoc.fontSize(fontSize);
        
        // If we have a table structure and this element has an X position
        if (hasTableStructure && element.x) {
          // Find which column this belongs to
          const columnIndex = columnPositions.findIndex(pos => Math.abs(pos - element.x) < 10);
          
          if (columnIndex >= 0) {
            // Calculate the width of this column
            const nextColumnX = columnPositions[columnIndex + 1] || pdfDoc.page.width - pdfDoc.page.margins.right;
            const columnWidth = nextColumnX - columnPositions[columnIndex] - 5; // Reduzierter Abstand
            
            // Calculate x position in the PDF (adjust for margins)
            const pdfX = pdfDoc.page.margins.left + (columnPositions[columnIndex] * 0.75); // Scale factor
            
            // If different row, move down
            if (element.y && currentY !== element.y) {
              currentY = element.y;
              pdfDoc.moveDown(0.2); // Reduzierter Abstand
            }
            
            // Position text at the correct column
            pdfDoc.text(element.text, pdfX, pdfDoc.y, {
              width: columnWidth,
              align: element.alignment || 'left',
              lineGap: 1 // Reduzierter Zeilenabstand
            });
          } else {
            // Normal text
            pdfDoc.text(element.text, {
              align: element.alignment || 'left',
              lineGap: 1 // Reduzierter Zeilenabstand
            });
            
            pdfDoc.moveDown(0.3); // Reduzierter Abstand
          }
        } else {
          // Normal text
          pdfDoc.text(element.text, {
            align: element.alignment || 'left',
            lineGap: 1 // Reduzierter Zeilenabstand
          });
          
          pdfDoc.moveDown(0.3); // Reduzierter Abstand
        }
      }
    }
  } else if (page.markdown) {
    // Fallback to markdown if no structured blocks
    console.log('Using markdown content with optimized formatting');
    
    // Parse markdown content
    const lines = page.markdown.split('\n');
    let inList = false;
    let listIndent = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isFirstLine = i === 0;
      
      // Detect headings
      if (line.startsWith('# ')) {
        // Heading 1
        if (!isFirstLine) {
          pdfDoc.moveDown(0.5);
        }
        pdfDoc.fontSize(14).font('Helvetica-Bold').text(line.replace('# ', ''), {
          lineGap: 2 // Reduzierter Zeilenabstand
        });
        
        // Add a separator line
        pdfDoc.moveDown(0.3);
        const lineWidth = pdfDoc.widthOfString(line.replace('# ', ''));
        pdfDoc
          .moveTo(pdfDoc.x, pdfDoc.y)
          .lineTo(pdfDoc.x + Math.min(lineWidth, 400), pdfDoc.y)
          .lineWidth(0.5) // Dünnere Linie
          .stroke();
          
        pdfDoc.moveDown(0.3);
        inList = false;
      } else if (line.startsWith('## ')) {
        // Heading 2
        if (!isFirstLine) {
          pdfDoc.moveDown(0.4);
        }
        pdfDoc.fontSize(12).font('Helvetica-Bold').text(line.replace('## ', ''), {
          lineGap: 2 // Reduzierter Zeilenabstand
        });
        
        // Add a thin separator line
        pdfDoc.moveDown(0.3);
        const lineWidth = pdfDoc.widthOfString(line.replace('## ', ''));
        pdfDoc
          .moveTo(pdfDoc.x, pdfDoc.y)
          .lineTo(pdfDoc.x + Math.min(lineWidth, 300), pdfDoc.y)
          .lineWidth(0.5) // Dünnere Linie
          .stroke();
          
        pdfDoc.moveDown(0.3);
        inList = false;
      } else if (line.startsWith('### ')) {
        // Heading 3
        if (!isFirstLine) {
          pdfDoc.moveDown(0.3);
        }
        pdfDoc.fontSize(11).font('Helvetica-Bold').text(line.replace('### ', ''), {
          lineGap: 2 // Reduzierter Zeilenabstand
        });
        pdfDoc.moveDown(0.3);
        inList = false;
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        // List item
        if (!inList) {
          // Start of a new list
          pdfDoc.moveDown(0.3);
          listIndent = 15; // Reduzierte Einrückung
          inList = true;
        }
        
        pdfDoc.fontSize(10).font('Helvetica').text(line, { 
          indent: listIndent,
          lineGap: 1 // Reduzierter Zeilenabstand 
        });
        pdfDoc.moveDown(0.2); // Minimaler Abstand zwischen Listenelementen
      } else if (line.trim() === '') {
        // Empty line
        if (inList) {
          // End of list
          inList = false;
          pdfDoc.moveDown(0.3);
        } else {
          pdfDoc.moveDown(0.5); // Reduzierter Absatzabstand
        }
      } else {
        // Erkenne Anrede
        const isGreeting = line.match(/^(Sehr geehrte|Liebe|Hallo|Guten Tag|Betreff)/i);
        
        if (isGreeting) {
          // Anrede mit kleinerem Abstand
          if (!isFirstLine) {
            pdfDoc.moveDown(0.3);
          }
          pdfDoc.fontSize(10).font('Helvetica').text(line, {
            lineGap: 1 // Sehr geringer Zeilenabstand
          });
          pdfDoc.moveDown(0.3);
        } else {
          // Normal text
          if (inList) {
            // End of list
            inList = false;
            pdfDoc.moveDown(0.3);
          }
          
          pdfDoc.fontSize(10).font('Helvetica').text(line, {
            paragraphGap: 3,
            lineGap: 1 // Reduzierter Zeilenabstand
          });
        }
      }
    }
  }
}

module.exports = {
  processImage,
}; 