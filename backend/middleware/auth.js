const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: {
          code: 'TOKEN_MISSING',
          message: 'Access token is required'
        }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token'
        }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid token'
        }
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Token has expired'
        }
      });
    }

    return res.status(500).json({
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication error'
      }
    });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: {
        code: 'ADMIN_REQUIRED',
        message: 'Admin access required'
      }
    });
  }
  next();
};

// Middleware to check if user is patient
const requirePatient = (req, res, next) => {
  if (req.user.role !== 'patient') {
    return res.status(403).json({
      error: {
        code: 'PATIENT_REQUIRED',
        message: 'Patient access required'
      }
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requirePatient
};
