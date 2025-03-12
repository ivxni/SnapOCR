const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log für Entwickler
  console.error(err);

  // Mongoose fehlerhafte ObjectID
  if (err.name === 'CastError') {
    const message = 'Ressource nicht gefunden';
    error = { message, statusCode: 404 };
  }

  // Mongoose Duplikatschlüssel
  if (err.code === 11000) {
    const message = 'Duplizierter Feldwert eingegeben';
    error = { message, statusCode: 400 };
  }

  // Mongoose Validierungsfehler
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Serverfehler'
  });
};

module.exports = errorHandler; 