const { getSupportedLanguages, getTranslations } = require('../services/i18nService');

function getLanguages(req, res) {
  return res.json({
    success: true,
    languages: getSupportedLanguages()
  });
}

function getLanguageTranslations(req, res) {
  const langCode = req.params.code || 'en';
  const data = getTranslations(langCode);

  return res.json({
    success: true,
    code: data.code,
    name: data.name,
    nativeName: data.nativeName,
    translations: data.translations
  });
}

module.exports = {
  getLanguages,
  getLanguageTranslations
};

