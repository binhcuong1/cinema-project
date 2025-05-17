const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.post('/', bookingController.createBooking);
router.post('/send-email', bookingController.sendEmail);

router.get('/:id', bookingController.getByScheduleID);

module.exports = router;