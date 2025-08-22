const { body, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      }
    });
  }
  next();
};

// Validation rules for registration
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  handleValidationErrors
];

// Validation rules for login
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Validation rules for slot query parameters
const validateSlotQuery = [
  query('from')
    .isISO8601()
    .withMessage('From date must be a valid ISO date'),
  query('to')
    .isISO8601()
    .withMessage('To date must be a valid ISO date')
    .custom((to, { req }) => {
      const from = new Date(req.query.from);
      const toDate = new Date(to);
      if (toDate <= from) {
        throw new Error('To date must be after from date');
      }
      return true;
    }),
  handleValidationErrors
];

// Validation rules for booking
const validateBooking = [
  body('slotId')
    .isMongoId()
    .withMessage('Slot ID must be a valid MongoDB ObjectId'),
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateSlotQuery,
  validateBooking,
  handleValidationErrors
};
