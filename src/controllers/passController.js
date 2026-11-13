const db = require('../db/database');
const crypto = require('crypto');

// Generate a secure QR token
function generateQrToken(userId, passNumber) {
  const data = `${userId}:${passNumber}:${Date.now()}`;
  return crypto.createHmac('sha256', process.env.JWT_SECRET || 'routeless-rural-mobility-super-secret-jwt-key-2026')
    .update(data)
    .digest('hex');
}

// Generate pass number: KA-HVR-YYYY-NNNN
function generatePassNumber(userId, district) {
  const year = new Date().getFullYear();
  const distCode = (district || 'HVR').substring(0, 3).toUpperCase();
  const seq = userId.toString().padStart(4, '0');
  return `KA-${distCode}-${year}-${seq}`;
}

// POST /api/passes/create  (authenticated)
function createPass(req, res) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, error: 'Authentication required.' });

    // Check for existing active pass
    const existing = db.prepare(
      "SELECT * FROM student_passes WHERE user_id = ? AND status IN ('active', 'pending')"
    ).get(user.id);

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'You already have an active or pending pass.',
        pass: existing
      });
    }

    const { course = 'General', class_year = '1st Year' } = req.body;

    const passNumber = generatePassNumber(user.id, user.district || 'HVR');
    const qrToken = generateQrToken(user.id, passNumber);

    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    const expiryDate = expiry.toISOString().split('T')[0];

    const result = db.prepare(`
      INSERT INTO student_passes
        (user_id, pass_number, qr_token, student_name, institution, district, village, course, class_year, status, is_verified, expiry_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 1, ?)
    `).run(
      user.id,
      passNumber,
      qrToken,
      user.full_name,
      user.institution || 'Govt First Grade College, Haveri',
      user.district || 'Haveri',
      user.village || 'Motebennur',
      course,
      class_year,
      expiryDate
    );

    const pass = db.prepare('SELECT * FROM student_passes WHERE id = ?').get(result.lastInsertRowid);

    return res.status(201).json({
      success: true,
      message: 'Student pass created successfully.',
      pass
    });
  } catch (err) {
    console.error('Create pass error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create student pass.' });
  }
}

// GET /api/passes/my  (authenticated)
function getMyPass(req, res) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, error: 'Authentication required.' });

    let pass = db.prepare(
      "SELECT * FROM student_passes WHERE user_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1"
    ).get(user.id);

    if (!pass) {
      // Auto-create pass for verified students
      const passNumber = generatePassNumber(user.id, user.district || 'HVR');
      const qrToken = generateQrToken(user.id, passNumber);

      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);
      const expiryDate = expiry.toISOString().split('T')[0];

      const result = db.prepare(`
        INSERT INTO student_passes
          (user_id, pass_number, qr_token, student_name, institution, district, village, course, class_year, status, is_verified, expiry_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'General', '1st Year', 'active', 1, ?)
      `).run(
        user.id,
        passNumber,
        qrToken,
        user.full_name,
        user.institution || 'Govt First Grade College, Haveri',
        user.district || 'Haveri',
        user.village || 'Motebennur',
        expiryDate
      );
      pass = db.prepare('SELECT * FROM student_passes WHERE id = ?').get(result.lastInsertRowid);
    }

    // Check expiry
    if (pass && pass.expiry_date) {
      const now = new Date();
      const expiry = new Date(pass.expiry_date);
      if (expiry < now && pass.status === 'active') {
        db.prepare("UPDATE student_passes SET status = 'expired' WHERE id = ?").run(pass.id);
        pass.status = 'expired';
      }
    }

    return res.json({ success: true, pass });
  } catch (err) {
    console.error('Get pass error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve student pass.' });
  }
}

// POST /api/passes/verify  (public - for scanners)
function verifyPass(req, res) {
  try {
    const { qr_token, location } = req.body;
    if (!qr_token) {
      return res.status(400).json({ success: false, error: 'QR token is required.' });
    }

    const pass = db.prepare(`
      SELECT sp.*, u.email, u.role
      FROM student_passes sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.qr_token = ?
    `).get(qr_token);

    let result, message, statusCode;

    if (!pass) {
      result = 'invalid';
      message = 'Invalid QR code. This pass does not exist.';
      statusCode = 400;
    } else if (pass.status === 'revoked') {
      result = 'revoked';
      message = 'This pass has been revoked.';
      statusCode = 403;
    } else if (pass.status === 'expired') {
      result = 'expired';
      message = 'This pass has expired. Please renew.';
      statusCode = 403;
    } else if (!pass.is_verified) {
      result = 'unverified';
      message = 'Student account not yet verified.';
      statusCode = 403;
    } else if (pass.status === 'active') {
      // Check expiry date
      if (pass.expiry_date && new Date(pass.expiry_date) < new Date()) {
        db.prepare("UPDATE student_passes SET status = 'expired' WHERE id = ?").run(pass.id);
        result = 'expired';
        message = 'Pass has just expired. Please renew.';
        statusCode = 403;
      } else {
        result = 'valid';
        message = 'Valid Student Pass. ✓';
        statusCode = 200;
      }
    } else {
      result = 'invalid';
      message = 'Invalid pass status.';
      statusCode = 400;
    }

    // Log verification event
    if (pass) {
      db.prepare(`
        INSERT INTO pass_verification_events (pass_id, qr_token, verified_by, result, location)
        VALUES (?, ?, ?, ?, ?)
      `).run(pass.id, qr_token, req.user ? req.user.id : null, result, location || null);
    }

    const responseData = {
      success: result === 'valid',
      result,
      message
    };

    if (result === 'valid' && pass) {
      responseData.student = {
        name: pass.student_name,
        pass_number: pass.pass_number,
        institution: pass.institution,
        district: pass.district,
        village: pass.village,
        course: pass.course,
        class_year: pass.class_year,
        valid_until: pass.expiry_date,
        status: pass.status
      };
    }

    return res.status(statusCode).json(responseData);
  } catch (err) {
    console.error('Verify pass error:', err);
    return res.status(500).json({ success: false, error: 'Pass verification failed.' });
  }
}

// POST /api/passes/revoke  (admin only)
function revokePass(req, res) {
  try {
    const { pass_id, reason } = req.body;
    if (!pass_id) return res.status(400).json({ success: false, error: 'pass_id required.' });

    db.prepare("UPDATE student_passes SET status = 'revoked', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(pass_id);
    return res.json({ success: true, message: 'Pass revoked.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to revoke pass.' });
  }
}

// POST /api/passes/renew  (authenticated)
function renewPass(req, res) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, error: 'Authentication required.' });

    const pass = db.prepare('SELECT * FROM student_passes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(user.id);
    if (!pass) return res.status(404).json({ success: false, error: 'No pass found to renew.' });

    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    const expiryDate = expiry.toISOString().split('T')[0];

    const newQrToken = generateQrToken(user.id, pass.pass_number + '-R' + Date.now());

    db.prepare(`
      UPDATE student_passes
      SET status = 'active', expiry_date = ?, qr_token = ?, is_verified = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(expiryDate, newQrToken, pass.id);

    const updated = db.prepare('SELECT * FROM student_passes WHERE id = ?').get(pass.id);
    return res.json({ success: true, message: 'Pass renewed successfully.', pass: updated });
  } catch (err) {
    console.error('Renew pass error:', err);
    return res.status(500).json({ success: false, error: 'Failed to renew pass.' });
  }
}

module.exports = { createPass, getMyPass, verifyPass, revokePass, renewPass };
