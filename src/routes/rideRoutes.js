const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', rideController.getAllRides);
router.get('/my-bookings', authenticateToken, rideController.getMyBookings);
router.get('/:id', rideController.getRideById);
router.post('/:id/book', authenticateToken, rideController.bookRide);
router.post('/bookings/:id/cancel', authenticateToken, rideController.cancelBooking);
router.post('/publish', authenticateToken, requireRole('driver'), rideController.publishRide);

module.exports = router;

