const express = require('express');
const router = express.Router();
const assistantController = require('../controllers/assistantController');
const { optionalAuth } = require('../middleware/auth');

router.post('/message', optionalAuth, assistantController.processMessage);
router.post('/intent', assistantController.parseIntentOnly);
router.get('/supported-languages', assistantController.getVoiceLanguages);

module.exports = router;

