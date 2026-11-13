const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

router.get('/districts', locationController.getDistricts);
router.get('/taluks', locationController.getTaluks);
router.get('/villages', locationController.getVillages);
router.get('/institutions', locationController.getInstitutions);
router.get('/stops', locationController.getBusStops);

module.exports = router;

