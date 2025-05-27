const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.post('/', bookingController.createBooking);
router.post('/popcorn-order/', bookingController.createPopcornOrder);
router.post('/send-email', bookingController.sendEmail);
router.post('/cancel/:ma_dat_ve', bookingController.cancelBooking);

router.get('/', bookingController.getBookings);
router.get('/:id', bookingController.getByScheduleID);
router.get('/detail/:ma_dat_ve', bookingController.getBookingDetailById);
router.get('/popcorn-order/:ma_don_dat', bookingController.getPopcornOrderDetailById);

module.exports = router;