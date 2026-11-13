const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { JWT_SECRET } = require('../middleware/auth');
const { translate } = require('../services/i18nService');

function register(req, res) {
  try {
    const { full_name, email, password, role = 'student', phone_number = '', village = '', institution = '', preferred_language = 'en' } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Full name, email, and password are required.'
      });
    }

    // Check existing email
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email already exists.'
      });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const result = db.prepare(`
      INSERT INTO users (full_name, email, password_hash, role, phone_number, village, institution, preferred_language)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(full_name, email, passwordHash, role, phone_number, village, institution, preferred_language);

    const user = db.prepare('SELECT id, full_name, email, role, phone_number, village, institution, preferred_language FROM users WHERE id = ?').get(result.lastInsertRowid);

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    // Insert welcome notification
    const welcomeMsg = translate('app_name', preferred_language) + ': Welcome aboard! Rural student transit sync active.';
    db.prepare('INSERT INTO notifications (user_id, title, message, notification_type) VALUES (?, ?, ?, ?)').run(
      user.id,
      'Welcome to ROUTELESS AI',
      welcomeMsg,
      'system'
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, error: 'Registration failed due to server error.' });
  }
}

function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.'
      });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    const safeUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      phone_number: user.phone_number,
      village: user.village,
      institution: user.institution,
      preferred_language: user.preferred_language
    };

    return res.json({
      success: true,
      message: 'Signed in successfully.',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Sign in failed due to server error.' });
  }
}

function logout(req, res) {
  return res.json({
    success: true,
    message: 'Signed out successfully.'
  });
}

function getProfile(req, res) {
  return res.json({
    success: true,
    user: req.user
  });
}

function updateProfile(req, res) {
  try {
    const { full_name, phone_number, village, institution, preferred_language } = req.body;
    const userId = req.user.id;

    db.prepare(`
      UPDATE users
      SET full_name = COALESCE(?, full_name),
          phone_number = COALESCE(?, phone_number),
          village = COALESCE(?, village),
          institution = COALESCE(?, institution),
          preferred_language = COALESCE(?, preferred_language),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(full_name, phone_number, village, institution, preferred_language, userId);

    const updatedUser = db.prepare('SELECT id, full_name, email, role, phone_number, village, institution, preferred_language FROM users WHERE id = ?').get(userId);

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
}

function updateLanguagePreference(req, res) {
  try {
    const { preferred_language } = req.body;
    if (!preferred_language) {
      return res.status(400).json({ success: false, error: 'Language code is required.' });
    }

    if (req.user) {
      db.prepare('UPDATE users SET preferred_language = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(preferred_language, req.user.id);
    }

    return res.json({
      success: true,
      message: 'Language preference saved.',
      language: preferred_language
    });
  } catch (err) {
    console.error('Language preference error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update language preference.' });
  }
}

function getDemoAccounts(req, res) {
  const users = db.prepare('SELECT id, full_name, email, role, village, institution, preferred_language FROM users').all();
  return res.json({
    success: true,
    default_password: 'Password123!',
    accounts: users
  });
}

function forgotPassword(req, res) {
  // In production, send a real email. For now, return a safe generic message.
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: 'Email required.' });

  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  // Always return success to prevent email enumeration
  return res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent. (Demo: check server logs for token.)',
    // In development, expose token so it can be tested:
    ...(process.env.NODE_ENV !== 'production' && user ? { dev_note: 'Configure email provider to enable real password reset emails.' } : {})
  });
}

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  updateLanguagePreference,
  getDemoAccounts,
  forgotPassword
};

