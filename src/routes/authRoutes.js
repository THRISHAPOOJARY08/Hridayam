const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const googleAuthController = require('../controllers/googleAuthController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticateToken, authController.getProfile);
router.get('/demo-accounts', authController.getDemoAccounts);
router.post('/forgot-password', authController.forgotPassword);
router.put('/profile', authenticateToken, authController.updateProfile);

// Google OAuth routes
router.get('/google/status', googleAuthController.googleStatus);
router.get('/google', googleAuthController.googleRedirect);
router.get('/google/callback', googleAuthController.googleCallback);
router.post('/google/token', googleAuthController.googleTokenVerify);

module.exports = router;

