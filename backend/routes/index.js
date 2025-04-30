const express = require('express');
const router = express.Router();

const movieRoutes = require('./movieRoutes');
const theaterRoutes = require('./theaterRoutes');
const promotionRoutes = require('./promotionRoutes');
const ageRoutes = require('./ageRoutes');
// const bookingRoutes = require('./bookingRoutes');
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const roomRoutes = require('./roomRoutes.js');
const seatRoutes = require('./seatRoutes.js');

router.use('/movies', movieRoutes);
router.use('/theaters', theaterRoutes);
router.use('/promotions', promotionRoutes);
router.use('/ages', ageRoutes);
// router.use('/bookings', bookingRoutes);
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/rooms', roomRoutes);
router.use('/seats', seatRoutes);

module.exports = router;