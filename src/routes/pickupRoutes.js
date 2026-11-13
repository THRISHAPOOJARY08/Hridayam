const express = require('express');
const router = express.Router();
const pickupController = require('../controllers/pickupController');
const { optionalAuth, authenticateToken, requireRole } = require('../middleware/auth');

router.post('/request', optionalAuth, pickupController.createPickupRequest);
router.get('/', pickupController.getPickupRequests);
router.get('/list', optionalAuth, pickupController.getPickupRequests);
router.patch('/:id/approve', authenticateToken, requireRole('admin'), pickupController.approvePickupRequest);
router.get('/admin/list', authenticateToken, requireRole('admin'), pickupController.adminListPickups);
router.post('/admin/update', authenticateToken, requireRole('admin'), pickupController.adminUpdatePickup);

module.exports = router;

