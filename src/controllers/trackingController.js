const db = require('../db/database');

function getLiveTracking(req, res) {
  try {
    const vehicles = db.prepare(`
      SELECT v.id, v.vehicle_name, v.vehicle_type, v.registration_number,
             v.available_seats, v.total_seats, v.verification_status,
             v.current_lat, v.current_lng, v.last_location_time, v.is_simulated_gps,
             u.full_name as driver_name, u.phone_number as driver_phone
      FROM vehicles v
      LEFT JOIN users u ON v.provider_id = u.id
      ORDER BY v.id ASC
    `).all();

    const tracked = vehicles.map(v => {
      // Determine tracking state
      const now = new Date();
      const lastTime = new Date(v.last_location_time || now);
      const diffMins = Math.floor((now - lastTime) / 60000);

      let tracking_label = 'Live GPS';
      let tracking_badge = 'live';

      if (v.is_simulated_gps) {
        tracking_label = 'Simulated Pilot Location (Demo)';
        tracking_badge = 'simulated';
      } else if (diffMins > 10) {
        tracking_label = `Last Known Location (${diffMins}m ago)`;
        tracking_badge = 'stale';
      }

      return {
        ...v,
        tracking_label,
        tracking_badge,
        eta_minutes: Math.max(4, Math.floor(Math.random() * 15) + 5),
        speed_kmh: 42,
        corridor: 'Byadgi - Motebennur - Haveri NH48 Corridor'
      };
    });

    return res.json({ success: true, count: tracked.length, vehicles: tracked });
  } catch (err) {
    console.error('Tracking error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve vehicle tracking telematics.' });
  }
}

function updateVehicleLocation(req, res) {
  try {
    const { vehicle_id, latitude, longitude, is_simulated = 0 } = req.body;
    if (!vehicle_id || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, error: 'Vehicle ID and coordinates are required.' });
    }

    db.prepare(`
      UPDATE vehicles
      SET current_lat = ?, current_lng = ?, last_location_time = CURRENT_TIMESTAMP, is_simulated_gps = ?
      WHERE id = ?
    `).run(Number(latitude), Number(longitude), Number(is_simulated), Number(vehicle_id));

    return res.json({
      success: true,
      message: 'Vehicle coordinates updated.',
      location: { latitude, longitude, timestamp: new Date().toISOString() }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update vehicle location.' });
  }
}

module.exports = {
  getLiveTracking,
  updateVehicleLocation
};

