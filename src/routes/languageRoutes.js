const express = require('express');
const router = express.Router();
const languageController = require('../controllers/languageController');

router.get('/', languageController.getLanguages);
router.get('/:code/translations', languageController.getLanguageTranslations);

module.exports = router;

