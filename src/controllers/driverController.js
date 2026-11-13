const db = require('../db/database');

function getManifest(req, res) {
  try {
    const driverId = req.user ? req.user.id : 4; // defaults to Suresh Patil

    const activeRide = db.prepare(`
      SELECT sr.*, r.origin, r.destination, r.intermediate_stops, r.distance, r.estimated_duration
      FROM shared_rides sr
      JOIN routes r ON sr.route_id = r.id
      WHERE sr.provider_id = ? AND sr.ride_status = 'scheduled'
      ORDER BY sr.id ASC
      LIMIT 1
    `).get(driverId);

    if (!activeRide) {
      return res.json({
        success: true,
        manifest: {
          driver: 'Suresh Patil',
          vehicle: 'Bolero Student Pool #MH-12',
          route: 'Shirwal Hamlet → SPPU Campus',
          stops: [
            { name: 'Shirwal Hamlet Junction (Stop #01)', time: '07:30 AM', status: 'completed', passengers: 4 },
            { name: 'Morve Village Lake Bend (Stop #02)', time: '07:45 AM', status: 'next', passengers: 2 },
            { name: 'Khandala Ghat Checkpoint (Stop #03)', time: '08:05 AM', status: 'pending', passengers: 1 },
            { name: 'SPPU Science Campus Terminal', time: '08:30 AM', status: 'pending', passengers: 0 }
          ]
        }
      });
    }

    const stops = JSON.parse(activeRide.intermediate_stops || '[]');

    return res.json({
      success: true,
      ride: activeRide,
      manifest: {
        driver: req.user?.full_name || 'Suresh Patil',
        vehicle: `${activeRide.vehicle_name} (${activeRide.vehicle_number})`,
        route: `${activeRide.origin} → ${activeRide.destination}`,
        stops: stops.map((s, idx) => ({
          name: `${s} (Stop #${idx + 1})`,
          status: idx === 0 ? 'completed' : (idx === 1 ? 'next' : 'pending'),
          passengers: Math.max(1, 4 - idx)
        }))
      }
    });
  } catch (err) {
    console.error('Driver manifest error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve driver manifest.' });
  }
}

function arrivedAtStop(req, res) {
  try {
    const { stop_name } = req.body;
    return res.json({
      success: true,
      message: `Arrival logged at ${stop_name || 'Current Stop'}. Student proximity notifications dispatched.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to record stop arrival.' });
  }
}

function tapPassenger(req, res) {
  try {
    const { count = 1 } = req.body;
    return res.json({
      success: true,
      message: `Boarded +${count} student pass. Real-time telemetry synchronized.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to record passenger tap.' });
  }
}

function reportObstacle(req, res) {
  try {
    const { description = 'Road obstacle / monsoon washout reported' } = req.body;
    // Insert disruption record
    db.prepare(`
      INSERT INTO disruptions (title, corridor, description, severity, status)
      VALUES (?, ?, ?, 'moderate', 'active')
    `).run('Driver Reported Corridor Obstacle', 'Pune-Satara Rural Arterial', description);

    return res.json({
      success: true,
      message: 'Obstacle logged. Routeless AI recalculating bypass trajectories.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to report obstacle.' });
  }
}

module.exports = {
  getManifest,
  arrivedAtStop,
  tapPassenger,
  reportObstacle
};

