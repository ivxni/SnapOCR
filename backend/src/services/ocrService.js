const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('../config/environment');

/**
 * Sendet eine Bilddatei an die Mistral OCR API und erhält den erkannten Text und PDF zurück
 * @param {string} filePath - Pfad zur Bilddatei
 * @returns {Promise<Object>} - Objekt mit erkanntem Text und PDF-Daten
 */
exports.processImage = async (filePath) => {
  try {
    // Datei lesen
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    
    // FormData erstellen
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: 'application/octet-stream' });
    formData.append('file', blob, fileName);
    
    // API-Anfrage senden
    const response = await axios.post(config.MISTRAL_OCR_API_URL, formData, {
      headers: {
        'Authorization': `Bearer ${config.MISTRAL_OCR_API_KEY}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // Erfolgreiche Antwort verarbeiten
    if (response.status === 200) {
      return {
        success: true,
        textContent: response.data.text,
        pdfData: response.data.pdf,
        metadata: {
          ocrConfidence: response.data.confidence || 0,
          processingTime: response.data.processingTime || 0,
          imageQuality: response.data.imageQuality || 'medium'
        }
      };
    } else {
      throw new Error('Fehler bei der OCR-Verarbeitung');
    }
  } catch (error) {
    console.error('OCR-Verarbeitungsfehler:', error);
    throw new Error(`OCR-Verarbeitungsfehler: ${error.message}`);
  }
};

/**
 * Speichert die PDF-Daten in einer Datei
 * @param {Buffer} pdfData - PDF-Daten als Buffer
 * @param {string} fileName - Name der zu erstellenden PDF-Datei
 * @returns {string} - Pfad zur gespeicherten PDF-Datei
 */
exports.savePdf = (pdfData, fileName) => {
  try {
    const pdfDir = path.join(__dirname, '../../uploads/pdfs');
    
    // Verzeichnis erstellen, falls es nicht existiert
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }
    
    const pdfPath = path.join(pdfDir, fileName);
    fs.writeFileSync(pdfPath, pdfData);
    
    return pdfPath;
  } catch (error) {
    console.error('Fehler beim Speichern der PDF:', error);
    throw new Error(`Fehler beim Speichern der PDF: ${error.message}`);
  }
}; 