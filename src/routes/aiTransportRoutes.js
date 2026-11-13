const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiTransportController');
const { optionalAuth } = require('../middleware/auth');

router.get('/ghost-routes', aiController.getGhostRoutes);
router.post('/journey-predictor', aiController.predictJourneySuccess);
router.get('/digital-twin', aiController.getDigitalTwin);
router.get('/equity-score', aiController.getEquityScore);
router.post('/road-intelligence', optionalAuth, aiController.reportRoadIssue);
router.get('/road-intelligence', aiController.getRoadReports);
router.get('/predictive-demand', aiController.getPredictiveDemand);

module.exports = router;

