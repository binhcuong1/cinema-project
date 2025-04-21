const express = require('express');
const router = express.Router();
const ageController = require('../controllers/ageController');

router.get('/', ageController.getAges);

module.exports = router;