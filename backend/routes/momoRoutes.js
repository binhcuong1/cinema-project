const express = require('express');
const router = express.Router();
const momoController = require('../controllers/momoController');


router.post('/create-qr', momoController.createQR);
router.post('/popcorn/create-qr', momoController.popcorn_CreateQR);

router.get('/check-payment-momo', momoController.checkPaymentMomo);
router.get('/popcorn/check-payment-momo', momoController.popcorn_checkPaymentMomo);

module.exports = router;