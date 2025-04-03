const express = require('express');
const router = express.Router();

const movieRoutes = require('./movieRoutes');
// const theaterRoutes = require('./theaterRoutes');
// const bookingRoutes = require('./bookingRoutes');
// const userRoutes = require('./userRoutes');

router.use('/movies', movieRoutes);
// router.use('/theaters', theaterRoutes);
// router.use('/bookings', bookingRoutes);
// router.use('/users', userRoutes);

module.exports = router;