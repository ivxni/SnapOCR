const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Speicheroptionen für Multer konfigurieren
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// Dateifilter für erlaubte Dateitypen
const fileFilter = (req, file, cb) => {
  // Erlaubte Dateitypen für OCR
  const allowedFileTypes = [
    'image/jpeg',
    'image/png',
    'image/tiff',
    'application/pdf'
  ];

  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Nicht unterstützter Dateityp. Bitte laden Sie ein Bild (JPEG, PNG, TIFF) oder PDF hoch.'), false);
  }
};

// Multer-Upload-Konfiguration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB Limit
  },
  fileFilter: fileFilter
});

module.exports = upload; 