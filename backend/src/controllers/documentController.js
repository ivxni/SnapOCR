const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Document = require('../models/Document');
const User = require('../models/User');
const ocrService = require('../services/ocrService');

// @desc    Dokument hochladen und OCR-Verarbeitung starten
// @route   POST /api/documents/upload
// @access  Private
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Bitte laden Sie eine Datei hoch'
      });
    }

    const { originalname, mimetype, path: filePath, size } = req.file;
    
    // Neues Dokument in der Datenbank erstellen
    const document = await Document.create({
      userId: req.user.id,
      originalFileName: originalname,
      pdfFileName: `${uuidv4()}.pdf`,
      fileSize: size,
      fileType: mimetype,
      status: 'processing'
    });

    // OCR-Verarbeitung asynchron starten
    res.status(202).json({
      success: true,
      message: 'Dokument hochgeladen und Verarbeitung gestartet',
      documentId: document._id
    });

    // OCR-Verarbeitung durchführen
    try {
      const ocrResult = await ocrService.processImage(filePath);
      
      // PDF speichern
      const pdfPath = ocrService.savePdf(ocrResult.pdfData, document.pdfFileName);
      
      // Dokument in der Datenbank aktualisieren
      document.status = 'completed';
      document.completedAt = Date.now();
      document.textContent = ocrResult.textContent;
      document.storageUrl = `/uploads/pdfs/${document.pdfFileName}`;
      document.metadata = ocrResult.metadata;
      
      await document.save();
      
      // Benutzerstatistik aktualisieren
      await User.findByIdAndUpdate(req.user.id, {
        $inc: {
          'usageStats.totalDocumentsConverted': 1,
          'usageStats.totalStorageUsed': size
        }
      });
      
      // Originaldatei löschen
      fs.unlinkSync(filePath);
    } catch (error) {
      // Bei Fehler Dokument als fehlgeschlagen markieren
      document.status = 'failed';
      await document.save();
      
      console.error('Fehler bei der OCR-Verarbeitung:', error);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Dokumentstatus abrufen
// @route   GET /api/documents/:id/status
// @access  Private
exports.getDocumentStatus = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Dokument nicht gefunden'
      });
    }
    
    // Prüfen, ob der Benutzer Eigentümer des Dokuments ist
    if (document.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Nicht autorisiert, auf dieses Dokument zuzugreifen'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: document._id,
        status: document.status,
        originalFileName: document.originalFileName,
        createdAt: document.createdAt,
        completedAt: document.completedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Alle Dokumente eines Benutzers abrufen
// @route   GET /api/documents
// @access  Private
exports.getUserDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ 
      userId: req.user.id,
      isArchived: false
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents.map(doc => ({
        id: doc._id,
        originalFileName: doc.originalFileName,
        status: doc.status,
        createdAt: doc.createdAt,
        completedAt: doc.completedAt,
        fileSize: doc.fileSize,
        storageUrl: doc.status === 'completed' ? doc.storageUrl : null
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Dokument herunterladen
// @route   GET /api/documents/:id/download
// @access  Private
exports.downloadDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Dokument nicht gefunden'
      });
    }
    
    // Prüfen, ob der Benutzer Eigentümer des Dokuments ist
    if (document.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Nicht autorisiert, auf dieses Dokument zuzugreifen'
      });
    }
    
    // Prüfen, ob das Dokument fertig verarbeitet wurde
    if (document.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Dokument ist noch nicht fertig verarbeitet'
      });
    }
    
    const pdfPath = path.join(__dirname, '../../uploads/pdfs', document.pdfFileName);
    
    // Prüfen, ob die Datei existiert
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        success: false,
        message: 'PDF-Datei nicht gefunden'
      });
    }
    
    res.download(pdfPath, document.originalFileName.replace(/\.[^/.]+$/, '.pdf'));
  } catch (error) {
    next(error);
  }
};

// @desc    Dokument archivieren
// @route   PUT /api/documents/:id/archive
// @access  Private
exports.archiveDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Dokument nicht gefunden'
      });
    }
    
    // Prüfen, ob der Benutzer Eigentümer des Dokuments ist
    if (document.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Nicht autorisiert, auf dieses Dokument zuzugreifen'
      });
    }
    
    document.isArchived = true;
    await document.save();
    
    res.status(200).json({
      success: true,
      message: 'Dokument erfolgreich archiviert'
    });
  } catch (error) {
    next(error);
  }
}; 