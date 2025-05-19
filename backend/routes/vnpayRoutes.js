const express = require('express');
const router = express.Router();
const vnpayController = require('../controllers/vnpayController');


router.post('/create-qr', vnpayController.createQR);
router.get('/check-payment-vnpay', vnpayController.checkPaymentVNPAY);

module.exports = router;