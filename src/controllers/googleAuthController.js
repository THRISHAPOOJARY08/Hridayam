const db = require('../db/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';
const JWT_SECRET = process.env.JWT_SECRET || 'routeless-rural-mobility-super-secret-jwt-key-2026';

// GET /api/auth/google/status
function googleStatus(req, res) {
  return res.json({
    configured: !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET),
    client_id_set: !!GOOGLE_CLIENT_ID,
    callback_url: GOOGLE_CALLBACK_URL
  });
}

// GET /api/auth/google  — redirect to Google OAuth
function googleRedirect(req, res) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.redirect('/login?error=google_not_configured');
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_CALLBACK_URL,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state: 'routeless-oauth-' + Date.now()
  });

  return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}

// GET /api/auth/google/callback  — handle Google OAuth callback
async function googleCallback(req, res) {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect('/login?error=google_cancelled');
  }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.redirect('/login?error=google_not_configured');
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code'
      }).toString()
    });

    if (!tokenRes.ok) {
      console.error('Google token exchange failed:', await tokenRes.text());
      return res.redirect('/login?error=google_token_failed');
    }

    const tokens = await tokenRes.json();
    if (!tokens.id_token) {
      return res.redirect('/login?error=google_no_id_token');
    }

    // Verify the ID token with Google
    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokens.id_token}`);
    if (!verifyRes.ok) {
      return res.redirect('/login?error=google_token_invalid');
    }

    const payload = await verifyRes.json();

    // Validate token claims
    if (payload.aud !== GOOGLE_CLIENT_ID) {
      console.error('Google token audience mismatch');
      return res.redirect('/login?error=google_audience_mismatch');
    }
    if (!payload.email_verified || payload.email_verified === 'false') {
      return res.redirect('/login?error=google_email_unverified');
    }
    if (!payload.email) {
      return res.redirect('/login?error=google_no_email');
    }

    const email = payload.email.toLowerCase();
    const name = payload.name || email.split('@')[0];

    // Find or create user
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      // Create new user from Google profile
      const tempPassword = bcrypt.hashSync(require('crypto').randomBytes(32).toString('hex'), 10);
      const result = db.prepare(`
        INSERT INTO users (full_name, email, password_hash, role, preferred_language, preferred_theme, village, institution, district)
        VALUES (?, ?, ?, 'student', 'en', 'light', '', '', '')
      `).run(name, email, tempPassword);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    }

    // Issue JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userPayload = encodeURIComponent(JSON.stringify({
      id: user.id, full_name: user.full_name, email: user.email,
      role: user.role, preferred_language: user.preferred_language, preferred_theme: user.preferred_theme
    }));

    // Redirect to login page with token (login.html picks it up and stores in localStorage)
    return res.redirect(`/login?token=${token}&user=${userPayload}`);

  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return res.redirect('/login?error=google_server_error');
  }
}

// POST /api/auth/google/token  — verify a Google ID token from frontend (alternative flow)
async function googleTokenVerify(req, res) {
  const { id_token } = req.body;
  if (!id_token) return res.status(400).json({ success: false, error: 'id_token required.' });
  if (!GOOGLE_CLIENT_ID) return res.status(400).json({ success: false, error: 'Google OAuth not configured.' });

  try {
    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${id_token}`);
    if (!verifyRes.ok) return res.status(401).json({ success: false, error: 'Invalid Google ID token.' });

    const payload = await verifyRes.json();
    if (payload.aud !== GOOGLE_CLIENT_ID) {
      return res.status(401).json({ success: false, error: 'Token audience mismatch.' });
    }

    const email = payload.email.toLowerCase();
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      const hash = bcrypt.hashSync(require('crypto').randomBytes(32).toString('hex'), 10);
      const r = db.prepare(`INSERT INTO users (full_name, email, password_hash, role, preferred_language, preferred_theme) VALUES (?, ?, ?, 'student', 'en', 'light')`).run(payload.name || email, email, hash);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(r.lastInsertRowid);
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ success: true, token, user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role, preferred_language: user.preferred_language, preferred_theme: user.preferred_theme } });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Google verification failed.' });
  }
}

module.exports = { googleStatus, googleRedirect, googleCallback, googleTokenVerify };
