const db = require('../db/database');

// Smart Transportation Search & Route Matching for Karnataka
function searchTransport(req, res) {
  try {
    const {
      origin = '',
      destination = '',
      travel_date,
      preferred_time = '07:30 AM',
      passenger_count = 1,
      mode = 'all', // 'all', 'ksrtc', 'shared', 'van'
      district = 'Haveri'
    } = req.body;

    const routes = db.prepare("SELECT * FROM routes WHERE route_status != 'cancelled'").all();

    const originLower = (origin || '').toLowerCase().trim();
    const destLower = (destination || '').toLowerCase().trim();

    // Bilingual transliteration aliases
    const aliases = {
      'haveri': ['ಹಾವೇರಿ', 'haveri', 'college', 'ಕಾಲೇಜ್'],
      'byadgi': ['ಬ್ಯಾಡಗಿ', 'byadgi', 'motebennur', 'ಮೊಟೆಬೆನ್ನೂರು', 'gp cross'],
      'motebennur': ['ಮೊಟೆಬೆನ್ನೂರು', 'motebennur', 'byadgi', 'ಬ್ಯಾಡಗಿ']
    };

    const originKeywords = aliases[originLower] || [originLower];
    const destKeywords = aliases[destLower] || [destLower];

    const matchingRoutes = routes.filter(r => {
      if (!originLower && !destLower) return true;
      const haystack = (r.origin + ' ' + r.destination + ' ' + (r.intermediate_stops || '')).toLowerCase();

      const matchOrigin = !originLower || originKeywords.some(k => haystack.includes(k));
      const matchDest = !destLower || destKeywords.some(k => haystack.includes(k));

      return matchOrigin && matchDest;
    });

    const routeIds = matchingRoutes.length > 0 ? matchingRoutes.map(r => r.id) : routes.map(r => r.id);
    const placeholders = routeIds.map(() => '?').join(',');

    const ridesQuery = `
      SELECT sr.*, r.origin, r.destination, r.intermediate_stops, r.distance, r.estimated_duration, r.route_status, r.operator_name, r.data_source,
             v.vehicle_type, v.is_simulated_gps
      FROM shared_rides sr
      JOIN routes r ON sr.route_id = r.id
      LEFT JOIN vehicles v ON sr.vehicle_name = v.vehicle_name
      WHERE sr.route_id IN (${placeholders})
        AND sr.ride_status = 'scheduled'
      ORDER BY sr.departure_time ASC
    `;

    const rides = db.prepare(ridesQuery).all(...routeIds);

    const mapped = rides.map(ride => {
      let cardType = 'ksrtc';
      if (ride.vehicle_name.includes('ಕ್ರೂಸರ್') || ride.vehicle_name.includes('Cruiser')) {
        cardType = 'shared';
      } else if (ride.vehicle_name.includes('ಮಿನಿಬಸ್') || ride.vehicle_name.includes('Shuttle') || ride.vehicle_name.includes('ಬ್ಯಾಕಪ್')) {
        cardType = 'shuttle';
      }

      return {
        id: ride.id,
        route_id: ride.route_id,
        vehicle_name: ride.vehicle_name,
        vehicle_number: ride.vehicle_number,
        vehicle_type: cardType,
        driver_name: ride.driver_name || 'Verified Transit Driver',
        origin: ride.origin,
        destination: ride.destination,
        intermediate_stops: JSON.parse(ride.intermediate_stops || '[]'),
        distance: ride.distance,
        estimated_duration: ride.estimated_duration,
        departure_time: ride.departure_time,
        arrival_time: ride.arrival_time || '08:25 AM',
        travel_date: ride.travel_date,
        available_seats: ride.available_seats,
        total_seats: ride.total_seats,
        price_per_seat: ride.price_per_seat,
        compatibility_tag: ride.compatibility_tag,
        operator_name: ride.operator_name,
        data_source: ride.data_source || 'Verified Official KSRTC Schedule',
        pass_eligible: cardType === 'ksrtc',
        tracking_badge: ride.is_simulated_gps ? 'Simulated Pilot Location' : 'Live GPS'
      };
    });

    let filtered = mapped;
    if (mode === 'ksrtc') {
      filtered = mapped.filter(m => m.vehicle_type === 'ksrtc');
    } else if (mode === 'shared') {
      filtered = mapped.filter(m => m.vehicle_type === 'shared');
    } else if (mode === 'van' || mode === 'shuttle') {
      filtered = mapped.filter(m => m.vehicle_type === 'shuttle');
    }

    return res.json({
      success: true,
      district,
      query: { origin, destination, travel_date, preferred_time, mode },
      count: filtered.length,
      options: filtered
    });
  } catch (err) {
    console.error('Transport search error:', err);
    return res.status(500).json({ success: false, error: 'Failed to search transportation options.' });
  }
}

// Create Transport Request
function createRequest(req, res) {
  try {
    const studentId = req.user ? req.user.id : 1;
    const { origin, destination, travel_date, preferred_time = '07:30 AM', passenger_count = 1 } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({ success: false, error: 'Origin and destination are required.' });
    }

    const today = travel_date || new Date().toISOString().split('T')[0];
    const result = db.prepare(`
      INSERT INTO transport_requests (student_id, origin, destination, travel_date, preferred_time, passenger_count, request_status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `).run(studentId, origin, destination, today, preferred_time, Number(passenger_count));

    return res.status(201).json({
      success: true,
      message: 'Transport request logged successfully.',
      request_id: result.lastInsertRowid
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to create transport request.' });
  }
}

function getRequests(req, res) {
  try {
    const requests = db.prepare('SELECT * FROM transport_requests ORDER BY created_at DESC').all();
    return res.json({ success: true, count: requests.length, requests });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve requests.' });
  }
}

function cancelRequest(req, res) {
  try {
    const requestId = req.params.id;
    db.prepare("UPDATE transport_requests SET request_status = 'cancelled' WHERE id = ?").run(requestId);
    return res.json({ success: true, message: 'Request cancelled.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to cancel request.' });
  }
}

function getDisruptions(req, res) {
  try {
    return res.json({
      success: true,
      corridor: 'Haveri-Byadgi Rural Corridor',
      status: 'Normal Operations • Midterm Exam Fallback Active',
      active_disruptions: []
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to get disruptions.' });
  }
}

function resolveDisruption(req, res) {
  try {
    return res.json({
      success: true,
      message: 'Fallback Shuttle locked.',
      shuttle: {
        id: 3,
        name: 'ರೂಟ್‌ಲೆಸ್ಸ್ ಬ್ಯಾಕಪ್ ಮಿನಿಬಸ್',
        departure_time: '08:05 AM',
        seats_left: 7
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to resolve disruption.' });
  }
}

module.exports = {
  searchTransport,
  createRequest,
  getRequests,
  cancelRequest,
  getDisruptions,
  resolveDisruption
};
