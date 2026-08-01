const multer = require('multer');

/**
 * Global error handling middleware
 * Matches Spring Boot's exception handling behavior
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Any multer upload error (wrong field name, too many files, size limit, etc.)
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: 'File size exceeds maximum limit of 10MB',
      LIMIT_UNEXPECTED_FILE: `Unexpected file field: "${err.field}"`,
      LIMIT_FILE_COUNT: 'Too many files uploaded',
      LIMIT_PART_COUNT: 'Too many parts in the form data',
      LIMIT_FIELD_KEY: 'Field name too long',
      LIMIT_FIELD_VALUE: 'Field value too long',
      LIMIT_FIELD_COUNT: 'Too many fields'
    };
    return res.status(400).json({
      message: messages[err.code] || 'File upload error'
    });
  }

  // Multer file type error (from custom fileFilter)
  if (err.message === 'Only image files are allowed!') {
    return res.status(400).json({
      message: err.message
    });
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map(e => e.message);
    return res.status(400).json({ 
      message: messages.join(', ') 
    });
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ 
      message: 'Resource already exists' 
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      message: 'Invalid token' 
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      message: 'Token expired' 
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({ message });
};

module.exports = errorHandler;
