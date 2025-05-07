const express = require('express');
const router = express.Router();

const movieRoutes = require('./movieRoutes');
const theaterRoutes = require('./theaterRoutes');
const promotionRoutes = require('./promotionRoutes');
const ageRoutes = require('./ageRoutes');
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const roomRoutes = require('./roomRoutes');
const seatRoutes = require('./seatRoutes');
const scheduleRoutes = require('./scheduleRoutes');
const bookingRoutes = require('./bookingRoutes');

router.use('/movies', movieRoutes);
router.use('/theaters', theaterRoutes);
router.use('/promotions', promotionRoutes);
router.use('/ages', ageRoutes);
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/rooms', roomRoutes);
router.use('/seats', seatRoutes);
router.use('/schedules', scheduleRoutes); 
router.use('/bookings', bookingRoutes);

module.exports = router;