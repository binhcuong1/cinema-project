const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seatController');

router.get('/:id', seatController.getSeatsByRoom);

module.exports = router;