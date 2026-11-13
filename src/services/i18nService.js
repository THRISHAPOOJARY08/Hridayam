const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../../locales');
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', speechCode: 'en-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechCode: 'kn-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechCode: 'ta-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', speechCode: 'te-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', speechCode: 'ml-IN' }
];

const dictionaries = {};

// Load dictionaries on startup
SUPPORTED_LANGUAGES.forEach(lang => {
  const filePath = path.join(LOCALES_DIR, `${lang.code}.json`);
  if (fs.existsSync(filePath)) {
    try {
      dictionaries[lang.code] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.error(`Failed to load locale for ${lang.code}:`, e.message);
    }
  }
});

function getSupportedLanguages() {
  return SUPPORTED_LANGUAGES;
}

function getTranslations(langCode = 'en') {
  const code = dictionaries[langCode] ? langCode : 'en';
  return dictionaries[code] || dictionaries['en'];
}

function translate(key, langCode = 'en', params = {}) {
  const dict = dictionaries[langCode]?.translations || dictionaries['en']?.translations || {};
  let text = dict[key] || dictionaries['en']?.translations[key] || key;

  Object.keys(params).forEach(p => {
    text = text.replace(new RegExp(`{${p}}`, 'g'), params[p]);
  });

  return text;
}

module.exports = {
  SUPPORTED_LANGUAGES,
  getSupportedLanguages,
  getTranslations,
  translate
};

