const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/users', authenticateToken, requireRole('admin'), adminController.getUsers);
router.get('/vehicles', authenticateToken, requireRole('admin'), adminController.getVehicles);
router.get('/requests', authenticateToken, requireRole('admin'), adminController.getAdminRequests);
router.post('/deploy-shuttle', authenticateToken, requireRole('admin'), adminController.deployShuttle);
router.patch('/petitions/:id/approve', authenticateToken, requireRole('admin'), adminController.approvePetition);
router.get('/passes', authenticateToken, requireRole('admin'), adminController.getAllPasses);

module.exports = router;

