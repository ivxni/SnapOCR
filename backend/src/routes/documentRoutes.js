const express = require('express');
const { 
  uploadDocument, 
  getDocumentStatus, 
  getUserDocuments, 
  downloadDocument, 
  archiveDocument 
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Alle Routen sind geschützt
router.use(protect);

// Dokument hochladen
router.post('/upload', upload.single('file'), uploadDocument);

// Dokumentstatus abrufen
router.get('/:id/status', getDocumentStatus);

// Alle Dokumente eines Benutzers abrufen
router.get('/', getUserDocuments);

// Dokument herunterladen
router.get('/:id/download', downloadDocument);

// Dokument archivieren
router.put('/:id/archive', archiveDocument);

module.exports = router; 