const express = require('express');
const router = express.Router();
const transportController = require('../controllers/transportController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

router.post('/search', optionalAuth, transportController.searchTransport);
router.post('/requests', authenticateToken, transportController.createRequest);
router.get('/requests', authenticateToken, transportController.getRequests);
router.delete('/requests/:id', authenticateToken, transportController.cancelRequest);
router.get('/disruptions', transportController.getDisruptions);
router.post('/resolve-disruption', optionalAuth, transportController.resolveDisruption);

module.exports = router;

