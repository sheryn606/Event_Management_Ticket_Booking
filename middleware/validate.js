const { validationResult } = require('express-validator');

// Validation middleware wrapper
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format errors to a single message string for simplicity, or return the first one
    const extractedErrors = errors.array().map(err => `${err.path}: ${err.msg}`);
    
    res.status(400);
    const error = new Error(`Validation failed: ${extractedErrors.join(', ')}`);
    error.errorCode = 'VALIDATION_ERROR';
    return next(error);
  }
  next();
};

module.exports = validate;
