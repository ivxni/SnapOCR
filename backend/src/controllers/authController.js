const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// @desc    Benutzer registrieren
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Prüfen, ob Benutzer bereits existiert
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Ein Benutzer mit dieser E-Mail-Adresse existiert bereits'
      });
    }

    // Benutzer erstellen
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      verificationToken: uuidv4()
    });

    // JWT-Token erstellen
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        uuid: user.uuid,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Benutzer anmelden
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validieren von E-Mail und Passwort
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Bitte geben Sie eine E-Mail-Adresse und ein Passwort an'
      });
    }

    // Benutzer in der Datenbank suchen
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Ungültige Anmeldeinformationen'
      });
    }

    // Passwort überprüfen
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Ungültige Anmeldeinformationen'
      });
    }

    // Letzten Login aktualisieren
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // JWT-Token erstellen
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        uuid: user.uuid,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Aktuellen Benutzer abrufen
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        uuid: user.uuid,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        settings: user.settings,
        usageStats: user.usageStats,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Benutzer abmelden
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Erfolgreich abgemeldet'
  });
}; 