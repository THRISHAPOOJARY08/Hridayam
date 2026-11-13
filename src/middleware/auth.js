const jwt = require('jsonwebtoken');
const db = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'routeless-rural-mobility-super-secret-jwt-key-2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required. Please sign in.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired session. Please sign in again.'
      });
    }

    const user = db.prepare('SELECT id, full_name, email, role, phone_number, village, institution, district, taluk, preferred_language, preferred_theme FROM users WHERE id = ?').get(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User account not found.'
      });
    }

    req.user = user;
    next();
  });
}

// Optional authentication middleware (populates req.user if token valid, continues if not)
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (!err && decoded && decoded.id) {
      const user = db.prepare('SELECT id, full_name, email, role, phone_number, village, institution, district, taluk, preferred_language, preferred_theme FROM users WHERE id = ?').get(decoded.id);
      req.user = user || null;
    } else {
      req.user = null;
    }
    next();
  });
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.'
      });
    }

    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: `Access denied. Requires ${role} role.`
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
  JWT_SECRET
};

