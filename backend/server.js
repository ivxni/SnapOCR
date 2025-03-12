const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Umgebungsvariablen laden
dotenv.config();

// Konfiguration importieren
const config = require('./src/config/environment');
const connectDB = require('./src/config/database');

// Routen importieren
const authRoutes = require('./src/routes/authRoutes');
const documentRoutes = require('./src/routes/documentRoutes');

// Middleware importieren
const errorHandler = require('./src/middleware/errorHandler');

// Express-App initialisieren
const app = express();

// Datenbank verbinden
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads-Verzeichnis erstellen, falls es nicht existiert
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Statische Dateien
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routen
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// Gesundheitscheck-Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server läuft' });
});

// 404-Handler für nicht gefundene Routen
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route nicht gefunden'
  });
});

// Fehlerbehandlung
app.use(errorHandler);

// Server starten
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Server läuft im ${config.NODE_ENV}-Modus auf Port ${PORT}`);
});
