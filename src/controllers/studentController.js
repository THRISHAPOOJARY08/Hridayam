const db = require('../db/database');

function getDashboard(req, res) {
  try {
    const student = req.user || db.prepare("SELECT * FROM users WHERE email = 'sahana@routeless.ai'").get();

    // Active bookings
    const bookings = db.prepare(`
      SELECT rb.*, sr.vehicle_name, sr.vehicle_number, sr.departure_time, sr.arrival_time,
             r.origin, r.destination, r.distance, r.estimated_duration, r.operator_name
      FROM ride_bookings rb
      JOIN shared_rides sr ON rb.ride_id = sr.id
      JOIN routes r ON sr.route_id = r.id
      WHERE rb.student_id = ? AND rb.booking_status = 'confirmed'
      ORDER BY sr.departure_time ASC
    `).all(student.id);

    // Active Pass info
    const pass = {
      pass_number: `KA-HVR-${student.id.toString().padStart(4, '0')}-2026`,
      student_name: student.full_name,
      college: student.institution || 'Govt First Grade College, Haveri',
      route_validity: `${student.village || 'Motebennur'} ↔ ${student.taluk || 'Byadgi'} ↔ Haveri Campus`,
      valid_until: '31-DEC-2026',
      status: 'ಸಕ್ರಿಯ (Active & Verified)',
      qr_code_payload: `ROUTELESS-PASS:${student.id}:${student.full_name}:${student.institution}`,
      free_concession: true
    };

    return res.json({
      success: true,
      student: {
        id: student.id,
        name: student.full_name,
        role: student.role,
        district: student.district || 'Haveri',
        taluk: student.taluk || 'Byadgi',
        village: student.village || 'Motebennur',
        institution: student.institution || 'Govt First Grade College, Haveri',
        nearest_stop: student.nearest_stop || 'Motebennur Gram Panchayat Circle',
        preferred_language: student.preferred_language || 'kn',
        preferred_theme: student.preferred_theme || 'light'
      },
      todays_travel: {
        origin: 'ಬ್ಯಾಡಗಿ ನಿಲ್ದಾಣ (Byadgi KSRTC Bus Stand)',
        destination: 'ಹಾವೇರಿ ಕಾಲೇಜು (Govt First Grade College, Haveri)',
        departure: '07:45 AM',
        status: 'ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ (On Time)',
        arrival_buffer: '18 ನಿಮಿಷ ಮುಂಚಿತ (18m early)'
      },
      active_bookings_count: bookings.length,
      bookings,
      pass
    });
  } catch (err) {
    console.error('Student dashboard error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve student dashboard.' });
  }
}

function updateThemePreference(req, res) {
  try {
    const { preferred_theme } = req.body;
    if (!['light', 'dark', 'system'].includes(preferred_theme)) {
      return res.status(400).json({ success: false, error: 'Invalid theme. Choose light, dark, or system.' });
    }

    if (req.user) {
      db.prepare('UPDATE users SET preferred_theme = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(preferred_theme, req.user.id);
    }

    return res.json({
      success: true,
      message: 'Theme preference updated.',
      preferred_theme
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update theme.' });
  }
}

module.exports = {
  getDashboard,
  updateThemePreference
};

