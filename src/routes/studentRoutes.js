const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { optionalAuth } = require('../middleware/auth');

router.get('/dashboard', optionalAuth, studentController.getDashboard);
router.put('/theme-preference', optionalAuth, studentController.updateThemePreference);

module.exports = router;

