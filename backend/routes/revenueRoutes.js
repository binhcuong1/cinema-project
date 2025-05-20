const express = require('express');
const router = express.Router();
const revenueController = require('../controllers/revenueController');

router.get('/revenue', revenueController.getTimeRevenue);
router.get('/movie-revenue', revenueController.getMovieRevenue);
router.get('/theater-revenue', revenueController.getTheaterRevenue);

module.exports = router;