const db = require('../db/database');
const { translate } = require('../services/i18nService');

// Get all available shared rides
function getAllRides(req, res) {
  try {
    const rides = db.prepare(`
      SELECT sr.*, r.origin, r.destination, r.distance, r.estimated_duration, r.intermediate_stops,
             u.full_name as driver_name, u.phone_number as driver_phone
      FROM shared_rides sr
      JOIN routes r ON sr.route_id = r.id
      JOIN users u ON sr.provider_id = u.id
      WHERE sr.ride_status = 'scheduled'
      ORDER BY sr.departure_time ASC
    `).all();

    const formatted = rides.map(r => ({
      ...r,
      intermediate_stops: JSON.parse(r.intermediate_stops || '[]')
    }));

    return res.json({ success: true, count: formatted.length, rides: formatted });
  } catch (err) {
    console.error('Get rides error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve shared rides.' });
  }
}

// Get single ride details
function getRideById(req, res) {
  try {
    const rideId = req.params.id;
    const ride = db.prepare(`
      SELECT sr.*, r.origin, r.destination, r.distance, r.estimated_duration, r.intermediate_stops,
             u.full_name as driver_name, u.phone_number as driver_phone
      FROM shared_rides sr
      JOIN routes r ON sr.route_id = r.id
      JOIN users u ON sr.provider_id = u.id
      WHERE sr.id = ?
    `).get(rideId);

    if (!ride) {
      return res.status(404).json({ success: false, error: 'Shared ride not found.' });
    }

    ride.intermediate_stops = JSON.parse(ride.intermediate_stops || '[]');

    return res.json({ success: true, ride });
  } catch (err) {
    console.error('Get ride details error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve ride details.' });
  }
}

// Book a shared ride (Concurrency-safe ACID seat allocation)
function bookRide(req, res) {
  try {
    const rideId = req.params.id;
    const studentId = req.user.id;
    const { seats_requested = 1, pickup_stop = '', dropoff_stop = '' } = req.body;
    const requestedCount = Number(seats_requested) || 1;

    // Check existing active booking to prevent duplicate booking
    const existing = db.prepare(`
      SELECT id FROM ride_bookings
      WHERE ride_id = ? AND student_id = ? AND booking_status = 'confirmed'
    `).get(rideId, studentId);

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'You already have an active confirmed booking for this ride.'
      });
    }

    // Begin transaction for concurrency-safe seat allocation
    db.exec('BEGIN TRANSACTION;');

    try {
      const ride = db.prepare('SELECT * FROM shared_rides WHERE id = ?').get(rideId);

      if (!ride) {
        db.exec('ROLLBACK;');
        return res.status(404).json({ success: false, error: 'Ride not found.' });
      }

      if (ride.available_seats < requestedCount) {
        db.exec('ROLLBACK;');
        return res.status(400).json({
          success: false,
          error: `Insufficient seats available. Only ${ride.available_seats} seat(s) remaining.`
        });
      }

      const totalFare = (ride.price_per_seat || 15) * requestedCount;

      // Create booking record
      const bookingResult = db.prepare(`
        INSERT INTO ride_bookings (ride_id, student_id, seats_requested, booking_status, fare_paid, pickup_stop, dropoff_stop)
        VALUES (?, ?, ?, 'confirmed', ?, ?, ?)
      `).run(rideId, studentId, requestedCount, totalFare, pickup_stop || 'Main Village Stop', dropoff_stop || 'Campus Gate');

      // Deduct seat count
      db.prepare(`
        UPDATE shared_rides
        SET available_seats = available_seats - ?
        WHERE id = ?
      `).run(requestedCount, rideId);

      db.exec('COMMIT;');

      const lang = req.user.preferred_language || 'en';
      const notificationTitle = translate('status_confirmed', lang);
      const notificationMsg = `${ride.vehicle_name} (${ride.vehicle_number}) • Departure: ${ride.departure_time} • ${requestedCount} seat(s) confirmed.`;

      db.prepare(`
        INSERT INTO notifications (user_id, title, message, notification_type)
        VALUES (?, ?, ?, 'booking')
      `).run(studentId, notificationTitle, notificationMsg);

      const booking = db.prepare(`
        SELECT rb.*, sr.vehicle_name, sr.vehicle_number, sr.departure_time, sr.travel_date
        FROM ride_bookings rb
        JOIN shared_rides sr ON rb.ride_id = sr.id
        WHERE rb.id = ?
      `).get(bookingResult.lastInsertRowid);

      return res.status(201).json({
        success: true,
        message: 'Ride booked successfully!',
        booking
      });
    } catch (txErr) {
      db.exec('ROLLBACK;');
      throw txErr;
    }
  } catch (err) {
    console.error('Book ride error:', err);
    return res.status(500).json({ success: false, error: 'Booking failed due to server error.' });
  }
}

// Cancel booking (Restores seat allocation)
function cancelBooking(req, res) {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;
    const role = req.user.role;

    const booking = db.prepare('SELECT * FROM ride_bookings WHERE id = ?').get(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    if (booking.student_id !== userId && role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized to cancel this booking.' });
    }

    if (booking.booking_status === 'cancelled') {
      return res.status(400).json({ success: false, error: 'Booking has already been cancelled.' });
    }

    db.exec('BEGIN TRANSACTION;');

    try {
      db.prepare("UPDATE ride_bookings SET booking_status = 'cancelled' WHERE id = ?").run(bookingId);

      // Restore seats to the ride
      db.prepare('UPDATE shared_rides SET available_seats = available_seats + ? WHERE id = ?').run(
        booking.seats_requested,
        booking.ride_id
      );

      db.exec('COMMIT;');

      const lang = req.user.preferred_language || 'en';
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, notification_type)
        VALUES (?, ?, ?, 'booking')
      `).run(booking.student_id, translate('status_cancelled', lang), 'Your ride booking has been cancelled and your seat released.');

      return res.json({
        success: true,
        message: 'Booking cancelled successfully and seats restored.'
      });
    } catch (txErr) {
      db.exec('ROLLBACK;');
      throw txErr;
    }
  } catch (err) {
    console.error('Cancel booking error:', err);
    return res.status(500).json({ success: false, error: 'Failed to cancel booking.' });
  }
}

// Get authenticated student's bookings
function getMyBookings(req, res) {
  try {
    const studentId = req.user.id;
    const bookings = db.prepare(`
      SELECT rb.*, sr.vehicle_name, sr.vehicle_number, sr.departure_time, sr.travel_date,
             r.origin, r.destination, r.distance, r.estimated_duration,
             u.full_name as driver_name, u.phone_number as driver_phone
      FROM ride_bookings rb
      JOIN shared_rides sr ON rb.ride_id = sr.id
      JOIN routes r ON sr.route_id = r.id
      JOIN users u ON sr.provider_id = u.id
      WHERE rb.student_id = ?
      ORDER BY rb.created_at DESC
    `).all(studentId);

    return res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    console.error('Get my bookings error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve bookings.' });
  }
}

// Publish new ride (Drivers / Admins)
function publishRide(req, res) {
  try {
    const providerId = req.user.id;
    const { route_id, vehicle_name, vehicle_number, departure_time, travel_date, total_seats, price_per_seat = 15, compatibility_tag } = req.body;

    if (!route_id || !vehicle_name || !vehicle_number || !departure_time || !travel_date || !total_seats) {
      return res.status(400).json({
        success: false,
        error: 'Route, vehicle name, plate, departure time, date, and seats are required.'
      });
    }

    const result = db.prepare(`
      INSERT INTO shared_rides (provider_id, route_id, vehicle_name, vehicle_number, departure_time, travel_date, total_seats, available_seats, price_per_seat, ride_status, compatibility_tag)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', ?)
    `).run(
      providerId,
      Number(route_id),
      vehicle_name,
      vehicle_number,
      departure_time,
      travel_date,
      Number(total_seats),
      Number(total_seats),
      Number(price_per_seat),
      compatibility_tag || 'Driver Scheduled Pool'
    );

    const newRide = db.prepare('SELECT * FROM shared_rides WHERE id = ?').get(result.lastInsertRowid);

    return res.status(201).json({
      success: true,
      message: 'Shared ride published successfully.',
      ride: newRide
    });
  } catch (err) {
    console.error('Publish ride error:', err);
    return res.status(500).json({ success: false, error: 'Failed to publish ride.' });
  }
}

module.exports = {
  getAllRides,
  getRideById,
  bookRide,
  cancelBooking,
  getMyBookings,
  publishRide
};

