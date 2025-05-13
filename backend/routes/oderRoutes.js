const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/popcorn-drink-history', orderController.getUserOrderHistory);
router.get('/popcorn-drink-history/:id', orderController.getPopcornDrinkOrderDetail);
router.get('/ticket-history', orderController.getTicketHistory);
router.get('/ticket-history/:id', orderController.getDetailTicket);

module.exports = router;
