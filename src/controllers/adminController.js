const db = require('../db/database');

function getUsers(req, res) {
  try {
    const { role } = req.query;
    let query = 'SELECT id, full_name, email, role, phone_number, village, institution, preferred_language, created_at FROM users';
    let params = [];

    if (role) {
      query += ' WHERE role = ?';
      params.push(role);
    }

    query += ' ORDER BY created_at DESC';
    const users = db.prepare(query).all(...params);

    return res.json({ success: true, count: users.length, users });
  } catch (err) {
    console.error('Admin get users error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve users.' });
  }
}

function getVehicles(req, res) {
  try {
    const vehicles = db.prepare(`
      SELECT v.*, u.full_name as provider_name, u.phone_number as provider_phone
      FROM vehicles v
      JOIN users u ON v.provider_id = u.id
      ORDER BY v.created_at DESC
    `).all();

    return res.json({ success: true, count: vehicles.length, vehicles });
  } catch (err) {
    console.error('Admin get vehicles error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve vehicles.' });
  }
}

function getAdminRequests(req, res) {
  try {
    const requests = db.prepare(`
      SELECT tr.*, u.full_name as student_name, u.phone_number, u.village, u.institution
      FROM transport_requests tr
      JOIN users u ON tr.student_id = u.id
      ORDER BY tr.created_at DESC
    `).all();

    return res.json({ success: true, count: requests.length, requests });
  } catch (err) {
    console.error('Admin get requests error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve transport requests.' });
  }
}

function deployShuttle(req, res) {
  try {
    const { count = 2, corridor = 'Pune-Satara South', route_id = 1 } = req.body;

    const route = db.prepare('SELECT * FROM routes WHERE id = ?').get(route_id) || db.prepare('SELECT * FROM routes LIMIT 1').get();
    const adminUser = req.user;

    const today = new Date().toISOString().split('T')[0];

    for (let i = 1; i <= Number(count); i++) {
      const shuttleNum = Math.floor(10 + Math.random() * 90);
      db.prepare(`
        INSERT INTO shared_rides (provider_id, route_id, vehicle_name, vehicle_number, departure_time, travel_date, total_seats, available_seats, price_per_seat, ride_status, compatibility_tag)
        VALUES (?, ?, ?, ?, '08:15 AM', ?, 14, 14, 15, 'scheduled', 'Admin On-Demand Rapid Deployment')
      `).run(adminUser.id, route.id, `Emergency Rapid Shuttle E-${shuttleNum}`, `MH-12-RS-${1000 + shuttleNum}`, today);
    }

    return res.json({
      success: true,
      message: `Successfully deployed ${count} emergency rapid shuttles to ${corridor}.`
    });
  } catch (err) {
    console.error('Deploy shuttle error:', err);
    return res.status(500).json({ success: false, error: 'Failed to deploy shuttles.' });
  }
}

function approvePetition(req, res) {
  try {
    const petitionId = req.params.id;
    const petition = db.prepare('SELECT * FROM demand_petitions WHERE id = ?').get(petitionId);

    if (!petition) {
      return res.status(404).json({ success: false, error: 'Petition not found.' });
    }

    db.prepare("UPDATE demand_petitions SET petition_status = 'approved' WHERE id = ?").run(petitionId);

    if (petition.student_id) {
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, notification_type)
        VALUES (?, ?, ?, 'system')
      `).run(
        petition.student_id,
        'Stop Petition Approved!',
        `Your on-demand stop petition for "${petition.stop_name}" has been approved by the Transit Coordination Board.`
      );
    }

    return res.json({
      success: true,
      message: `Temporary stop "${petition.stop_name}" approved successfully.`
    });
  } catch (err) {
    console.error('Approve petition error:', err);
    return res.status(500).json({ success: false, error: 'Failed to approve petition.' });
  }
}

function getAllPasses(req, res) {
  try {
    const passes = db.prepare(`
      SELECT sp.*, u.email
      FROM student_passes sp
      JOIN users u ON sp.user_id = u.id
      ORDER BY sp.created_at DESC
    `).all();
    return res.json({ success: true, passes });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve passes.' });
  }
}

module.exports = {
  getUsers,
  getVehicles,
  getAdminRequests,
  deployShuttle,
  approvePetition,
  getAllPasses
};

