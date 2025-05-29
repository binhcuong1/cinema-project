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
const bannerRoutes = require('./bannerRoutes')
const ticketTypeRoutes = require('./ticket-typeRoutes');
const popcornDrinkRouters = require('./popcorn-drinkRoutes');
const orderRoutes = require('./oderRoutes');
const vnpayRoutes = require('./vnpayRoutes');
const revenueRoutes = require('./revenueRoutes');
const momoRoutes = require('./momoRoutes');

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
router.use('/banners', bannerRoutes)
router.use('/ticket-types', ticketTypeRoutes);
router.use('/popcorn-drink', popcornDrinkRouters)
router.use('/orders', orderRoutes);
router.use('/vnpay', vnpayRoutes);
router.use('/momo', momoRoutes);
router.use('/revenue', revenueRoutes);

module.exports = router;