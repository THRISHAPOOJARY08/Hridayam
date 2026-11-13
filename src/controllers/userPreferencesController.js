const db = require('../db/database');

const SUPPORTED_LANGUAGES = ['kn', 'en', 'hi', 'te', 'ta', 'ml'];
const SUPPORTED_THEMES = ['light', 'dark', 'system'];

// GET /api/users/me/preferences
function getPreferences(req, res) {
  try {
    const user = req.user || db.prepare("SELECT * FROM users WHERE email = 'sahana@routeless.ai'").get();

    return res.json({
      success: true,
      user_id: user ? user.id : 1,
      language: user ? (user.preferred_language || 'kn') : 'kn',
      theme: user ? (user.preferred_theme || 'light') : 'light'
    });
  } catch (err) {
    console.error('Get preferences error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve preferences.' });
  }
}

// PATCH /api/users/me/preferences
function updatePreferences(req, res) {
  try {
    const { language, theme } = req.body;

    if (language && !SUPPORTED_LANGUAGES.includes(language.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Unsupported language code "${language}". Supported: ${SUPPORTED_LANGUAGES.join(', ')}`
      });
    }

    if (theme && !SUPPORTED_THEMES.includes(theme.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Unsupported theme "${theme}". Supported: ${SUPPORTED_THEMES.join(', ')}`
      });
    }

    const user = req.user || db.prepare("SELECT * FROM users WHERE email = 'sahana@routeless.ai'").get();

    const newLang = language ? language.toLowerCase() : (user.preferred_language || 'kn');
    const newTheme = theme ? theme.toLowerCase() : (user.preferred_theme || 'light');

    if (user && user.id) {
      db.prepare(`
        UPDATE users
        SET preferred_language = ?, preferred_theme = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(newLang, newTheme, user.id);
    }

    return res.json({
      success: true,
      message: 'Preferences updated successfully.',
      language: newLang,
      theme: newTheme
    });
  } catch (err) {
    console.error('Update preferences error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update user preferences.' });
  }
}

module.exports = {
  getPreferences,
  updatePreferences,
  SUPPORTED_LANGUAGES,
  SUPPORTED_THEMES
};

