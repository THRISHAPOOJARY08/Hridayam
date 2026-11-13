const express = require('express');
const router = express.Router();
const db = require('../db/database');

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const studentRoutes = require('./studentRoutes');
const transportRoutes = require('./transportRoutes');
const rideRoutes = require('./rideRoutes');
const locationRoutes = require('./locationRoutes');
const trackingRoutes = require('./trackingRoutes');
const pickupRoutes = require('./pickupRoutes');
const aiTransportRoutes = require('./aiTransportRoutes');
const assistantRoutes = require('./assistantRoutes');
const languageRoutes = require('./languageRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const adminRoutes = require('./adminRoutes');
const notificationRoutes = require('./notificationRoutes');
const driverRoutes = require('./driverRoutes');
const passRoutes = require('./passRoutes');
const emergencyRoutes = require('./emergencyRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/student', studentRoutes);
router.use('/transport', transportRoutes);
router.use('/rides', rideRoutes);
router.use('/locations', locationRoutes);
router.use('/tracking', trackingRoutes);
router.use('/pickups', pickupRoutes);
router.use('/ai', aiTransportRoutes);
router.use('/assistant', assistantRoutes);
router.use('/languages', languageRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/driver', driverRoutes);
router.use('/passes', passRoutes);
router.use('/emergency', emergencyRoutes);

// Health check endpoint verifying both server and database connectivity
router.get('/health', (req, res) => {
  try {
    const dbTest = db.prepare('SELECT 1 as test').get();
    const dbConnected = dbTest && dbTest.test === 1;

    res.json({
      status: 'online',
      database: dbConnected ? 'connected' : 'error',
      platform: 'ROUTELESS: THE LAST MILE | KARNATAKA',
      version: '2.0.0',
      pilot_district: 'Haveri (ಹಾವೇರಿ)',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'degraded',
      database: 'disconnected',
      error: 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
