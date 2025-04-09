const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/environment');

// Schützt Routen
exports.protect = async (req, res, next) => {
  let token;

  // Token aus dem Authorization-Header extrahieren
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Prüfen, ob Token existiert
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Nicht autorisiert, bitte melden Sie sich an'
    });
  }

  try {
    // Token verifizieren
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Benutzer aus der Datenbank abrufen
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Nicht autorisiert, bitte melden Sie sich an'
    });
  }
};

// Beschränkt den Zugriff auf bestimmte Rollen
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Die Rolle ${req.user.role} ist nicht berechtigt, auf diese Ressource zuzugreifen`
      });
    }
    next();
  };
}; 