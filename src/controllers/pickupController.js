const db = require('../db/database');

function createPickupRequest(req, res) {
  try {
    const studentId = req.user ? req.user.id : null;
    const {
      district = 'Haveri',
      taluk = 'Byadgi',
      village,
      landmark,
      destination = 'Govt First Grade College, Haveri',
      travel_date,
      preferred_time = '07:30 AM',
      passenger_count = 1,
      comments = ''
    } = req.body;

    if (!village || !landmark) {
      return res.status(400).json({
        success: false,
        error: 'Village and pickup landmark are required.'
      });
    }

    const today = travel_date || new Date().toISOString().split('T')[0];

    const result = db.prepare(`
      INSERT INTO pickup_requests (student_id, district, taluk, village, landmark, destination, travel_date, preferred_time, passenger_count, comments, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `).run(studentId, district, taluk, village, landmark, destination, today, preferred_time, Number(passenger_count) || 1, comments);

    // Notify user
    if (studentId) {
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, notification_type)
        VALUES (?, ?, ?, 'pickup')
      `).run(
        studentId,
        'Bus Stop Petition Logged',
        `Demand petition for "${landmark}, ${village}" received. Transit Coordination Board will review density cluster.`
      );
    }

    const created = db.prepare('SELECT * FROM pickup_requests WHERE id = ?').get(result.lastInsertRowid);

    return res.status(201).json({
      success: true,
      message: 'Bus Stop on Demand petition submitted successfully.',
      petition: created
    });
  } catch (err) {
    console.error('Create pickup request error:', err);
    return res.status(500).json({ success: false, error: 'Failed to submit pickup petition.' });
  }
}

function getPickupRequests(req, res) {
  try {
    const requests = db.prepare(`
      SELECT pr.*, u.full_name as student_name, u.phone_number as student_phone
      FROM pickup_requests pr
      LEFT JOIN users u ON pr.student_id = u.id
      ORDER BY pr.created_at DESC
    `).all();

    // Group by village to compute unmet demand concentration
    const clusteredDemand = db.prepare(`
      SELECT village, taluk, district, COUNT(*) as total_petitions, SUM(passenger_count) as total_commuters
      FROM pickup_requests
      GROUP BY village, taluk
      ORDER BY total_commuters DESC
    `).all();

    return res.json({
      success: true,
      count: requests.length,
      clustered_demand: clusteredDemand,
      petitions: requests
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve pickup requests.' });
  }
}

function approvePickupRequest(req, res) {
  try {
    const petitionId = req.params.id;
    const petition = db.prepare('SELECT * FROM pickup_requests WHERE id = ?').get(petitionId);

    if (!petition) {
      return res.status(404).json({ success: false, error: 'Petition not found.' });
    }

    db.prepare("UPDATE pickup_requests SET status = 'approved' WHERE id = ?").run(petitionId);

    // If student user exists, notify them
    if (petition.student_id) {
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, notification_type)
        VALUES (?, ?, ?, 'system')
      `).run(
        petition.student_id,
        'Stop Petition Approved! / ನಿಲ್ದಾಣ ಮಂಜೂರಾಗಿದೆ',
        `ನಿಮ್ಮ "${petition.landmark}, ${petition.village}" ಬೇಡಿಕೆಯ ನಿಲುಗಡೆಯನ್ನು ಹಾವೇರಿ ಸಾರಿಗೆ ಮಂಡಳಿಯು ಮಂಜೂರು ಮಾಡಿದೆ.`
      );
    }

    return res.json({
      success: true,
      message: `Pickup point "${petition.landmark}" approved as official temporary stop.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to approve petition.' });
  }
}

function adminListPickups(req, res) {
  try {
    const requests = db.prepare(`
      SELECT pr.*, u.full_name as student_name
      FROM pickup_requests pr
      LEFT JOIN users u ON pr.student_id = u.id
      ORDER BY pr.created_at DESC
    `).all();
    return res.json({ success: true, requests });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve requests.' });
  }
}

function adminUpdatePickup(req, res) {
  try {
    const { request_id, status } = req.body;
    if (!request_id || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'request_id and valid status required.' });
    }
    db.prepare('UPDATE pickup_requests SET status = ? WHERE id = ?').run(status, request_id);
    return res.json({ success: true, message: `Request ${status}.` });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update request.' });
  }
}

module.exports = {
  createPickupRequest,
  getPickupRequests,
  approvePickupRequest,
  adminListPickups,
  adminUpdatePickup
};

