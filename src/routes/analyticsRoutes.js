const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/dashboard', analyticsController.getDashboardAnalytics);
router.get('/routes', analyticsController.getRouteAnalytics);
router.get('/demand', analyticsController.getDemandAnalytics);

module.exports = router;

