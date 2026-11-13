const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

router.get('/status', optionalAuth, emergencyController.getStatus);
router.post('/simulate', authenticateToken, emergencyController.simulate);
router.post('/reset', authenticateToken, emergencyController.resetSimulation);
router.post('/allocate', authenticateToken, emergencyController.runAllocation);

module.exports = router;
