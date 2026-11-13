const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { optionalAuth } = require('../middleware/auth');

router.get('/manifest', optionalAuth, driverController.getManifest);
router.post('/arrived', optionalAuth, driverController.arrivedAtStop);
router.post('/tap-passenger', optionalAuth, driverController.tapPassenger);
router.post('/obstacle', optionalAuth, driverController.reportObstacle);

module.exports = router;

