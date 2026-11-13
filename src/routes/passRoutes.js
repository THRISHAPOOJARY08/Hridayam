const express = require('express');
const router = express.Router();
const passController = require('../controllers/passController');
const { authenticateToken, optionalAuth, requireRole } = require('../middleware/auth');

router.post('/create', authenticateToken, passController.createPass);
router.get('/my', authenticateToken, passController.getMyPass);
router.post('/verify', optionalAuth, passController.verifyPass);
router.post('/revoke', authenticateToken, requireRole('admin'), passController.revokePass);
router.post('/renew', authenticateToken, passController.renewPass);

module.exports = router;
