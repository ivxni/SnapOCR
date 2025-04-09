const dotenv = require('dotenv');

// Umgebungsvariablen laden
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/mistral-ocr',
  JWT_SECRET: process.env.JWT_SECRET || 'mistral-ocr-secret-key',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  NODE_ENV: process.env.NODE_ENV || 'development',
  MISTRAL_OCR_API_KEY: process.env.MISTRAL_OCR_API_KEY,
  MISTRAL_OCR_API_URL: process.env.MISTRAL_OCR_API_URL || 'https://api.mistral.ai/ocr'
}; 