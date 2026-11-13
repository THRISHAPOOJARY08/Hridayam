const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const studentController = require('../controllers/studentController');
const userPreferencesController = require('../controllers/userPreferencesController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);

// Phase 5: Specific User Preferences API
router.get('/me/preferences', optionalAuth, userPreferencesController.getPreferences);
router.patch('/me/preferences', optionalAuth, userPreferencesController.updatePreferences);

// Backward-compatible individual endpoints
router.put('/language-preference', optionalAuth, authController.updateLanguagePreference);
router.put('/theme-preference', optionalAuth, studentController.updateThemePreference);

module.exports = router;
