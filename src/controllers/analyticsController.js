const db = require('../db/database');

function getDashboardAnalytics(req, res) {
  try {
    const totalStudents = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'").get().count;
    const totalRequests = db.prepare('SELECT COUNT(*) as count FROM transport_requests').get().count;
    const activeJourneys = db.prepare("SELECT COUNT(*) as count FROM shared_rides WHERE ride_status = 'scheduled'").get().count;
    const availableSeats = db.prepare("SELECT COALESCE(SUM(available_seats), 0) as total FROM shared_rides WHERE ride_status = 'scheduled'").get().total;
    const totalVehicles = db.prepare('SELECT COUNT(*) as count FROM vehicles').get().count;
    const totalBookings = db.prepare("SELECT COUNT(*) as count FROM ride_bookings WHERE booking_status = 'confirmed'").get().count;

    // Requests by status
    const statusCounts = db.prepare(`
      SELECT request_status, COUNT(*) as count
      FROM transport_requests
      GROUP BY request_status
    `).all();

    // High demand villages
    const highDemandVillages = db.prepare(`
      SELECT village, COUNT(*) as request_count
      FROM (
        SELECT origin as village FROM transport_requests
        UNION ALL
        SELECT village FROM users WHERE role = 'student' AND village IS NOT NULL AND village != ''
      )
      GROUP BY village
      ORDER BY request_count DESC
      LIMIT 5
    `).all();

    // Most requested routes
    const topRoutes = db.prepare(`
      SELECT r.id, r.origin, r.destination, r.distance, r.estimated_duration, COUNT(sr.id) as scheduled_trips
      FROM routes r
      LEFT JOIN shared_rides sr ON r.id = sr.route_id
      GROUP BY r.id
      ORDER BY scheduled_trips DESC
      LIMIT 5
    `).all();

    return res.json({
      success: true,
      stats: {
        total_students: totalStudents,
        total_requests: totalRequests,
        active_journeys: activeJourneys,
        available_seats: availableSeats,
        total_vehicles: totalVehicles,
        total_bookings: totalBookings,
        grid_reliability: '99.8%',
        arrival_buffer_safe_mins: 8
      },
      requests_by_status: statusCounts,
      high_demand_villages: highDemandVillages,
      top_routes: topRoutes
    });
  } catch (err) {
    console.error('Analytics dashboard error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve analytics.' });
  }
}

function getRouteAnalytics(req, res) {
  try {
    const routes = db.prepare(`
      SELECT r.*,
        (SELECT COUNT(*) FROM shared_rides WHERE route_id = r.id) as ride_count,
        (SELECT COUNT(*) FROM transport_requests WHERE origin = r.origin AND destination = r.destination) as request_count
      FROM routes r
    `).all();

    return res.json({ success: true, routes });
  } catch (err) {
    console.error('Route analytics error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve route analytics.' });
  }
}

function getDemandAnalytics(req, res) {
  try {
    const petitions = db.prepare(`
      SELECT dp.*, u.full_name as student_name
      FROM demand_petitions dp
      LEFT JOIN users u ON dp.student_id = u.id
      ORDER BY dp.nearby_students_count DESC
    `).all();

    const corridorDemand = db.prepare(`
      SELECT corridor, SUM(nearby_students_count) as total_students, COUNT(*) as petition_count
      FROM demand_petitions
      GROUP BY corridor
      ORDER BY total_students DESC
    `).all();

    return res.json({
      success: true,
      corridor_demand: corridorDemand,
      petitions
    });
  } catch (err) {
    console.error('Demand analytics error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve demand analytics.' });
  }
}

module.exports = {
  getDashboardAnalytics,
  getRouteAnalytics,
  getDemandAnalytics
};

