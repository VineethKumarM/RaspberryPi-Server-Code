const express = require('express');
const router = express.Router();
const hueBridgeController = require('../controllers/hueBridge');

router.get('/allLights', hueBridgeController.lightList);
router.post('/lightOn', hueBridgeController.lightOn);
router.post('/lightOff', hueBridgeController.lightOff);
router.post('/lightconfig', hueBridgeController.lightconfig);

module.exports = router;